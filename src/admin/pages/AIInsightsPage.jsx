// ─────────────────────────────────────────────
// FILE: src/admin/pages/AIInsightsPage.jsx
// AI Reports powered by NVIDIA API
// Supports: moonshotai/kimi-k2-instruct + thudm/glm-4-9b-chat
// ─────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Key, Copy, Check, Trash2, RefreshCw, Bot, User, AlertCircle, Info } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { format } from 'date-fns';
import { getDisplayCountry } from '../../utils/geo';

// NVIDIA NIM API — routed through Vite proxy to avoid CORS
const NVIDIA_BASE_URL = '/nvidia-api/v1';

const MODELS = [
  { id: 'z-ai/glm-5.1', label: 'GLM 5.1', sub: 'Z.ai · SOTA Reasoning' },
  { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6', sub: 'MoonshotAI · Long-horizon MoE' },
  { id: 'deepseek-ai/deepseek-r1', label: 'DeepSeek R1', sub: 'DeepSeek · Advanced reasoning' },
];

const REPORT_TEMPLATES = [
  {
    id: 'revenue',
    label: '📈 Revenue Analysis',
    description: 'Trends, forecasts & growth opportunities',
    prompt: (data) => `You are an expert e-commerce analyst. Analyze the following store data and provide a detailed revenue analysis with insights, trends, and actionable recommendations.\n\nStore Data:\n${JSON.stringify(data, null, 2)}\n\nPlease provide:\n1. Revenue trend analysis\n2. Top performing categories\n3. Growth opportunities\n4. Specific recommendations to increase revenue\n5. Risk factors to watch`,
  },
  {
    id: 'visitors',
    label: '👥 Visitor Behavior Report',
    description: 'Session insights & conversion optimization',
    prompt: (data) => `You are a UX and conversion rate optimization expert. Analyze this visitor data and provide actionable insights.\n\nVisitor Data:\n${JSON.stringify(data, null, 2)}\n\nPlease provide:\n1. Visitor behavior patterns\n2. Session quality assessment\n3. Conversion rate bottlenecks\n4. Page load performance analysis\n5. Top 5 concrete improvements to boost conversion`,
  },
  {
    id: 'products',
    label: '📦 Product Performance',
    description: 'Inventory advice & pricing strategy',
    prompt: (data) => `You are a product and inventory management expert. Analyze these products and provide strategic recommendations.\n\nProduct Data:\n${JSON.stringify(data, null, 2)}\n\nPlease provide:\n1. Best and worst performing products\n2. Inventory risk assessment (low stock alerts)\n3. Pricing strategy recommendations\n4. Products to promote or discount\n5. Suggested new product categories`,
  },
  {
    id: 'orders',
    label: '🛒 Order Intelligence',
    description: 'Order patterns & fulfillment insights',
    prompt: (data) => `You are an e-commerce operations expert. Analyze these order patterns and provide operational insights.\n\nOrder Data:\n${JSON.stringify(data, null, 2)}\n\nPlease provide:\n1. Order volume trends\n2. Fulfillment performance analysis\n3. Cancellation patterns and causes\n4. Customer retention opportunities\n5. Operational improvements`,
  },
  {
    id: 'executive',
    label: '📋 Executive Summary',
    description: 'Full weekly store overview',
    prompt: (data) => `You are a senior e-commerce consultant. Write a comprehensive executive summary of this store's performance.\n\nComplete Store Data:\n${JSON.stringify(data, null, 2)}\n\nWrite a professional executive summary including:\n1. Overall business health score (1-10) with reasoning\n2. Key wins this period\n3. Critical issues requiring immediate attention\n4. 30-day action plan (prioritized)\n5. 90-day strategic outlook\n\nFormat the response clearly with sections and bullet points.`,
  },
];

function buildContext(store) {
  const { products, orders, sessions, siteSettings } = store;
  const sessionCount = sessions.length;
  const avgTime = sessionCount > 0 ? Math.round(sessions.reduce((s, sess) => s + (sess.timeSpent || 0), 0) / sessionCount) : 0;
  const avgLoad = sessionCount > 0 ? Math.round(sessions.reduce((s, sess) => s + (sess.perf?.fullLoad || 0), 0) / sessionCount) : 0;

  const countryCounts = {};
  sessions.forEach((s) => {
    const c = getDisplayCountry(s.geo, '');
    if (!c) return;
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });

  return {
    storeName: siteSettings.storeName,
    products: products.map(p => ({ name: p.name, category: p.category, price: p.price, originalPrice: p.originalPrice, stock: p.stock, rating: p.rating, reviewCount: p.reviewCount, badge: p.badge })),
    orders: {
      total: orders.length,
      byStatus: {
        delivered: orders.filter(o => o.status === 'Delivered').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        pending: orders.filter(o => o.status === 'Pending').length,
        cancelled: orders.filter(o => o.status === 'Cancelled').length,
      },
      totalRevenue: orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + parseFloat(o.amount), 0).toFixed(2),
      avgOrderValue: orders.length > 0 ? (orders.reduce((s, o) => s + parseFloat(o.amount), 0) / orders.length).toFixed(2) : 0,
    },
    visitors: {
      totalSessions: sessionCount,
      avgSessionTimeSeconds: avgTime,
      avgPageLoadMs: avgLoad,
      topCountries: Object.entries(countryCounts).sort((a,b) => b[1]-a[1]).slice(0,5),
    },
  };
}

function Markdown({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];
  const renderedElements = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-2.5 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-white/80 text-xs sm:text-sm">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const cleanRows = tableRows.filter(
        row => !row.every(cell => cell.trim().match(/^-+$/))
      );

      if (cleanRows.length > 0) {
        const hasHeader = cleanRows.length > 1;
        const headers = hasHeader ? cleanRows[0] : [];
        const bodyRows = hasHeader ? cleanRows.slice(1) : cleanRows;

        renderedElements.push(
          <div key={`table-wrapper-${key}`} className="overflow-x-auto my-3 rounded-xl border border-[#2a2a2a] bg-[#161616]/40">
            <table className="w-full text-left border-collapse text-xs">
              {hasHeader && (
                <thead>
                  <tr className="border-b border-[#2a2a2a] bg-white/5">
                    {headers.map((cell, idx) => (
                      <th key={idx} className="p-2.5 font-semibold text-white/90">{cell}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/5">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-white/80">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
      inTable = false;
    }
  };

  const parseInline = (str) => {
    const parts = str.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-semibold text-white">{part}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList(i);
      inTable = true;
      const cells = line
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      const content = line.trim().substring(2);
      listItems.push(parseInline(content));
      continue;
    } else if (inList) {
      flushList(i);
    }

    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      renderedElements.push(<div key={`hr-${i}`} className="border-t border-[#2a2a2a] my-4" />);
      continue;
    }

    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-base sm:text-lg font-bold text-white mt-4 mb-2">
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-sm sm:text-base font-bold text-white mt-4 mb-2">
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-xs sm:text-sm font-semibold text-white mt-3 mb-1.5">
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    renderedElements.push(
      <p key={`p-${i}`} className="text-white/80 text-xs sm:text-sm leading-relaxed mb-2">
        {parseInline(line)}
      </p>
    );
  }

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
}

function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium mt-0.5 ${isAI ? 'bg-gradient-to-br from-neutral-600 to-neutral-700 text-white' : 'bg-[#222222]/50 text-white/70'}`}>
        {isAI ? <Bot size={15} /> : <User size={14} />}
      </div>
      <div className={`flex-1 max-w-3xl ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isAI ? 'bg-[#1c1c1c]/60 border border-[#2a2a2a] text-white/90 rounded-tl-sm' : 'bg-white/10 border border-white/15 text-white/80 rounded-tr-sm whitespace-pre-wrap'}`}>
          {isAI ? <Markdown text={msg.content} /> : msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAI ? '' : 'justify-end'}`}>
          <span className="text-white/25 text-[10px]">{msg.time}</span>
          {isAI && (
            <button onClick={copy} className="text-white/25 hover:text-white/60 transition-colors">
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const { aiConfig, setAiConfig, aiHistory, addAiReport, clearAiHistory, ...storeData } = useAdminStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(!aiConfig.apiKey);
  const [localKey, setLocalKey] = useState(aiConfig.apiKey);
  const initialModel = MODELS.some(m => m.id === aiConfig.model) ? aiConfig.model : MODELS[0].id;
  const [localModel, setLocalModel] = useState(initialModel);
  const [showKey, setShowKey] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // If the persisted model is invalid/deprecated, auto-update store to the new default
    if (!MODELS.some(m => m.id === aiConfig.model)) {
      setAiConfig({ model: MODELS[0].id });
    }
  }, [aiConfig.model, setAiConfig]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveConfig = () => {
    setAiConfig({ apiKey: localKey, model: localModel });
    setShowConfig(false);
  };

  const callNvidiaAPI = async (msgs) => {
    const model = aiConfig.model || MODELS[0].id;
    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: msgs,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || err?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response received.';
  };

  const sendMessage = async (content) => {
    if (!aiConfig.apiKey) { setShowConfig(true); return; }
    if (!content.trim() || loading) return;
    setError('');

    const userMsg = { role: 'user', content, time: format(new Date(), 'HH:mm') };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const context = buildContext(storeData);
      const systemPrompt = `You are an expert e-commerce analytics assistant for the store "${storeData.siteSettings?.storeName || 'LUXE'}". You have access to live store data and provide actionable, data-driven insights. Be concise, clear, and specific. Use bullet points and sections where helpful. CRITICAL: You must provide your answers in both Arabic and English at the same time. For each section, recommendation, or table row, present both the English text and its Arabic translation cleanly.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Store context for reference:\n${JSON.stringify(context, null, 2)}` },
        { role: 'assistant', content: 'I have your store data. How can I help you analyze it?' },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const reply = await callNvidiaAPI(apiMessages);
      const aiMsg = { role: 'assistant', content: reply, time: format(new Date(), 'HH:mm') };
      setMessages(prev => [...prev, aiMsg]);
      addAiReport({ query: content, response: reply, model: aiConfig.model, timestamp: new Date().toISOString() });
    } catch (e) {
      setError(e.message || 'Failed to get AI response. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTemplate = (template) => {
    if (!aiConfig.apiKey) { setShowConfig(true); return; }
    setError('');
    const context = buildContext(storeData);
    const prompt = template.prompt(context);
    const userMsg = { role: 'user', content: `Run report: ${template.label} — ${template.description}`, time: format(new Date(), 'HH:mm') };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const systemPrompt = `You are an expert e-commerce analytics assistant for "${storeData.siteSettings?.storeName || 'LUXE'}". Provide detailed, actionable insights with clear sections.`;
    callNvidiaAPI([{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }])
      .then(reply => {
        setMessages(prev => [...prev, { role: 'assistant', content: reply, time: format(new Date(), 'HH:mm') }]);
        addAiReport({ query: template.label, response: reply, model: aiConfig.model || MODELS[0].id, timestamp: new Date().toISOString() });
      })
      .catch(e => setError(e.message || 'Failed to get AI response.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-4">
      {/* Config Panel */}
      {showConfig && (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Key size={16} className="text-white/70" />
            <h3 className="text-white font-semibold text-sm">Configure NVIDIA AI API</h3>
            {aiConfig.apiKey && <button onClick={() => setShowConfig(false)} className="ml-auto text-white/40 hover:text-white text-xs">Hide</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">NVIDIA API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localKey}
                  onChange={e => setLocalKey(e.target.value)}
                  placeholder="nvapi-..."
                  className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-white/30 font-mono"
                />
                <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">{showKey ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Model</label>
              <select value={localModel} onChange={e => setLocalModel(e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30">
                {MODELS.map(m => <option key={m.id} value={m.id} className="bg-[#1c1c1c]">{m.label} — {m.sub}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveConfig} className="px-4 py-2 text-sm text-white bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl font-medium hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20">
              Save & Connect
            </button>
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Info size={11} />
              Get your key at <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:underline">build.nvidia.com</a>
            </div>
          </div>
        </div>
      )}

      {/* Connected status + config toggle */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${aiConfig.apiKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${aiConfig.apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {aiConfig.apiKey ? `Connected · ${MODELS.find(m => m.id === (aiConfig.model || MODELS[0].id))?.label || MODELS[0].label}` : 'Not configured — add your API key'}
        </div>
        {!showConfig && (
          <button onClick={() => setShowConfig(true)} className="text-xs text-white/40 hover:text-white flex items-center gap-1 bg-[#222222]/50 border border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-all">
            <Key size={11} /> API Settings
          </button>
        )}
        {aiConfig.apiKey && (
          <div className="flex items-center bg-[#222222]/50 border border-[#3a3a3a] rounded-lg px-2 py-1">
            <span className="text-[10px] text-white/45 uppercase tracking-wider mr-1.5 select-none">Model:</span>
            <select
              value={aiConfig.model || MODELS[0].id}
              onChange={e => {
                setAiConfig({ model: e.target.value });
                setLocalModel(e.target.value);
              }}
              className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium pr-1"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-[#1c1c1c] text-white text-xs">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto text-xs text-white/40 hover:text-rose-400 flex items-center gap-1.5 bg-[#222222]/50 border border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-all hover:border-rose-500/20">
            <Trash2 size={11} /> Clear chat
          </button>
        )}
      </div>

      {/* Quick Report Templates */}
      <div className="flex gap-2 flex-wrap">
        {REPORT_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => handleRunTemplate(t)}
            disabled={loading}
            className="flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c]/60 hover:bg-[#252525]/90 hover:border-[#3a3a3a] text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-white text-xs font-medium">{t.label}</span>
            <span className="text-white/40 text-[10px]">{t.description}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-white/70" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI Store Intelligence</h3>
              <p className="text-white/40 text-sm max-w-md">Ask anything about your store's performance, or click a report template above to generate instant insights powered by {MODELS.find(m => m.id === (aiConfig.model || MODELS[0].id))?.label || MODELS[0].label}.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {['What products should I restock?', 'How can I improve conversion rate?', 'Which country has the most visitors?', 'Give me a sales forecast for next month'].map(q => (
                  <button key={q} onClick={() => sendMessage(q)} disabled={loading} className="text-left text-xs text-white/60 bg-[#222222]/30 hover:bg-[#222222]/70 border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl px-4 py-2.5 transition-all disabled:opacity-40">
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center flex-shrink-0">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-[#222222]/50 border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
            <AlertCircle size={13} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-rose-400/50 hover:text-rose-400"><Trash2 size={11} /></button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask about revenue, visitors, products, orders... (Enter to send)"
              rows={1}
              disabled={loading}
              className="flex-1 bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-white/30 placeholder-white/30 resize-none disabled:opacity-50 transition-colors"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-white disabled:opacity-40 hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Report History */}
      {aiHistory.length > 0 && (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2a]">
            <h3 className="text-white text-sm font-semibold">Report History</h3>
            <button onClick={clearAiHistory} className="text-white/30 hover:text-rose-400 text-xs transition-colors">Clear</button>
          </div>
          <div className="divide-y divide-[#2a2a2a] max-h-48 overflow-y-auto">
            {aiHistory.slice(0, 10).map((r, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-3 hover:bg-[#252525]/40 transition-colors">
                <Sparkles size={12} className="text-white/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs truncate">{r.query}</p>
                  <p className="text-white/30 text-[10px]">{r.timestamp ? format(new Date(r.timestamp), 'MMM d, HH:mm') : ''} · {r.model?.split('/')[1] || 'AI'}</p>
                </div>
                <button
                  onClick={() => setMessages([{ role: 'user', content: r.query, time: '' }, { role: 'assistant', content: r.response, time: '' }])}
                  className="text-white/30 hover:text-white/70 text-xs transition-colors whitespace-nowrap"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
