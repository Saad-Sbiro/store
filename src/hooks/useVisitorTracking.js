// ─────────────────────────────────────────────
// FILE: src/hooks/useVisitorTracking.js
// Collects detailed visitor session data
// ─────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { api } from '../services/api';
import { normalizeGeo } from '../utils/geo';

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, device, os };
};

const getPerformanceMetrics = () => {
  try {
    const timing = performance.timing;
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      return {
        dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        tcp: Math.round(nav.connectEnd - nav.connectStart),
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domLoad: Math.round(nav.domContentLoadedEventEnd - nav.responseEnd),
        fullLoad: Math.round(nav.loadEventEnd - nav.startTime),
      };
    }
    if (timing && timing.loadEventEnd > 0) {
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - timing.responseEnd,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
      };
    }
  } catch {
    return { dns: 0, tcp: 0, ttfb: 0, domLoad: 0, fullLoad: 0 };
  }
  return { dns: 0, tcp: 0, ttfb: 0, domLoad: 0, fullLoad: 0 };
};

const GEO_TIMEOUT_MS = 3500;

const geoProviders = [
  {
    url: 'https://ipwho.is/',
    map: (data) => {
      if (data.success === false) throw new Error(data.message || 'geo lookup failed');
      return {
        country: data.country,
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
        ip: data.ip,
      };
    },
  },
  {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    map: (data) => ({
      country: data.country,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      ip: data.ip,
    }),
  },
  {
    url: 'https://api.country.is/',
    map: (data) => ({
      countryCode: data.country,
      ip: data.ip,
    }),
  },
  {
    url: 'https://ipapi.co/json/',
    map: (data) => ({
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      ip: data.ip,
    }),
  },
];

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('geo lookup failed');
    return await res.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const fetchGeoData = async () => {
  let partialGeo = normalizeGeo();

  for (const provider of geoProviders) {
    try {
      const data = await fetchJsonWithTimeout(provider.url);
      const geo = normalizeGeo(provider.map(data));
      if (geo.country || geo.countryCode) return geo;
      if (geo.ip && !partialGeo.ip) partialGeo = geo;
    } catch {
      // Try the next provider. The dashboard should never fabricate a country.
    }
  }

  return partialGeo;
};

export function useVisitorTracking() {
  const addSession = useAdminStore(s => s.addSession);
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);
  const pagesRef = useRef([window.location.pathname]);
  const scrollDepthRef = useRef(0);
  const clicksRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Track scroll depth
    const onScroll = () => {
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      if (depth > scrollDepthRef.current) scrollDepthRef.current = depth;
    };

    // Track clicks
    const onClick = () => { clicksRef.current += 1; };

    // Track page changes (for SPA)
    const onPopState = () => {
      const path = window.location.pathname;
      if (!pagesRef.current.includes(path)) pagesRef.current.push(path);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);

    const perf = getPerformanceMetrics();
    const { browser, device, os } = getBrowserInfo();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startTime = new Date().toISOString();

    sessionRef.current = { sessionId, startTime, perf, browser, device, os };

    // Fetch geo in background and log session_start to DB
    fetchGeoData().then(geo => {
      if (sessionRef.current) sessionRef.current.geo = geo;
      api.logEvent('session_start', window.location.pathname, null, {
        sessionId,
        perf,
        browser,
        device,
        os,
        geo,
        screenResolution: `${window.screen.width}×${window.screen.height}`,
        language: navigator.language,
        referrer: document.referrer || 'Direct'
      });
    });

    // Save session on page unload
    const saveSession = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const current = sessionRef.current || {};
      const session = {
        ...current,
        timeSpent,
        pages: pagesRef.current,
        scrollDepth: scrollDepthRef.current,
        clicks: clicksRef.current,
        referrer: document.referrer || 'Direct',
        screenResolution: `${window.screen.width}×${window.screen.height}`,
        language: navigator.language,
        endTime: new Date().toISOString(),
      };
      
      try {
        addSession(session);
        // Log session_end to database
        api.logEvent('session_end', window.location.pathname, null, {
          sessionId,
          timeSpent,
          scrollDepth: scrollDepthRef.current,
          clicks: clicksRef.current,
          pages: pagesRef.current
        });
      } catch (error) {
        console.warn('Failed to save visitor session:', error);
      }
    };

    window.addEventListener('beforeunload', saveSession);
    // Also save after 30s in case user stays (periodic snapshot)
    const interval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (sessionRef.current) {
        sessionRef.current._lastTimeSpent = timeSpent;
      }
      // Periodic ping/page_view log to keep session active
      api.logEvent('page_view', window.location.pathname, null, {
        sessionId,
        timeSpent,
        scrollDepth: scrollDepthRef.current,
        clicks: clicksRef.current
      });
    }, 30000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('beforeunload', saveSession);
      clearInterval(interval);
    };
  }, [addSession]);
}
