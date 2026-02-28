// File: src/components/global/HandyGidiChat.tsx
// Global floating FAQ Bot + WhatsApp Chat widget
// Usage: import HandyGidiChat from '@/components/global/HandyGidiChat';
//        Add <HandyGidiChat /> once in App.tsx or your root layout

import { useState, useRef, useEffect } from 'react';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';
const WA_NUMBER = '2347051094001'; // WhatsApp number (international format, no +)

// ── FAQ DATA ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: '📚 Courses',
    items: [
      { q: 'What courses do you offer?', a: 'We offer 14+ courses across 12 categories: Computer Appreciation, Graphic Design, Web Design, AI & Data Analysis, Social Media Management, Digital Marketing, Interior Design, Leadership & Management, Programming, Office Productivity, Business Development, and Empowerment Programs.' },
      { q: 'How long are the courses?', a: 'Durations range from 4 to 8 weeks. Computer Appreciation is 4 weeks, Web Design is 8 weeks, and most others fall between 5–6 weeks.' },
      { q: 'Are classes online or physical?', a: 'Our training is hands-on and physical at our Lugbe, Abuja centre. This ensures you get the practical experience needed to become job-ready.' },
      { q: 'Do I need prior experience?', a: 'No experience needed! We have courses for complete beginners. We also have advanced programs for professionals looking to upgrade their skills.' },
    ]
  },
  {
    category: '💰 Fees & Payment',
    items: [
      { q: 'How much do courses cost?', a: 'Fees range from ₦40,000 to ₦70,000. Computer Appreciation: ₦40,000 · Graphic Design: ₦45,000 · Social Media: ₦50,000 · AI & Data Analysis: ₦60,000 · Web Design: ₦70,000.' },
      { q: 'Is there a payment plan?', a: 'Yes! We offer flexible payment plans. Contact us on WhatsApp or visit our centre to discuss an arrangement that works for you.' },
      { q: 'How do I pay?', a: 'You can pay online through our student portal or in person at our centre. Admin will verify your payment and activate your enrolment.' },
    ]
  },
  {
    category: '📍 Location & Contact',
    items: [
      { q: 'Where are you located?', a: '1st Dodo Mall, Suite 7, off Winners Highway, opposite Hossana Estate Phase 3, behind AMAC Market, New FHA, Lugbe, Abuja.' },
      { q: 'How do I reach you?', a: 'WhatsApp/Call: 07051094001 · Email: Gidisk2001@gmail.com · Instagram: @Handygiditrainingcentre' },
    ]
  },
  {
    category: '🎓 Enrolment & Certificates',
    items: [
      { q: 'How do I enrol?', a: 'Register on our website, browse and select your course, then complete payment. Once admin approves, you get full access.' },
      { q: 'Do you give certificates?', a: 'Yes! You receive a HandyGidi Training Centre certificate upon successfully completing any course.' },
      { q: 'Are internships available?', a: 'Yes! We are hiring interns. Click "Apply Now" on the website or contact us on WhatsApp for details.' },
    ]
  },
];

const ALL_QA = FAQS.flatMap(f => f.items.map(i => ({ ...i, category: f.category })));

type Tab = 'faq' | 'chat';
interface Msg { id: number; from: 'bot' | 'user'; text: string; time: string; }

const now = () => new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

function findAnswer(input: string): string {
  const q = input.toLowerCase();
  const scored = ALL_QA.map(item => {
    const words = item.q.toLowerCase().split(' ').filter(w => w.length > 3);
    const score = words.filter(w => q.includes(w)).length;
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);

  if (scored[0]?.score > 0) return scored[0].a;
  if (/hi|hello|hey|good/.test(q)) return "Hello! 👋 Welcome to HandyGidi Training Centre. Ask me about courses, fees, location or enrolment!";
  if (/thank/.test(q)) return "You're welcome! 😊 Anything else I can help with?";
  if (/bye|goodbye/.test(q)) return "Goodbye! 👋 You can always reach us on WhatsApp: 07051094001.";
  return "I'm not sure about that. Try asking about our courses, fees, location or enrolment — or chat with us directly on WhatsApp! 😊";
}

export default function HandyGidiChat() {
  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState<Tab>('faq');
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [unread,  setUnread]  = useState(0);
  const [openCat, setOpenCat] = useState<string | null>(FAQS[0].category);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: 'bot', text: "Hi! 👋 I'm HandyBot. Ask me anything about HandyGidi Training Centre — courses, fees, location or enrolment!", time: now() }
  ]);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
  }, [open, tab]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    const userMsg: Msg = { id: Date.now(), from: 'user', text: msg, time: now() };
    setMessages(p => [...p, userMsg]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { id: Date.now() + 1, from: 'bot', text: findAnswer(msg), time: now() }]);
    }, 800 + Math.random() * 500);
  };

  const handleFaqClick = (q: string, a: string) => {
    setTab('chat');
    setTimeout(() => {
      setMessages(p => [...p, { id: Date.now(), from: 'user', text: q, time: now() }]);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages(p => [...p, { id: Date.now() + 1, from: 'bot', text: a, time: now() }]);
      }, 700);
    }, 200);
  };

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello HandyGidi! I have a question about your courses.')}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .hgc *{box-sizing:border-box;margin:0;padding:0}

        /* ── FAB ── */
        .hgc-fab{
          position:fixed;bottom:24px;right:24px;z-index:9998;
          width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;
          background:linear-gradient(135deg,${GOLD},${GOLD2});
          box-shadow:0 6px 28px rgba(234,179,8,.6);
          display:flex;align-items:center;justify-content:center;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;
        }
        .hgc-fab:hover{transform:scale(1.12);box-shadow:0 10px 40px rgba(234,179,8,.75)}
        .hgc-fab-ico{font-size:26px;line-height:1;transition:transform .3s}
        .hgc-fab.is-open .hgc-fab-ico{transform:rotate(45deg)}
        .hgc-badge{
          position:absolute;top:-4px;right:-4px;
          width:22px;height:22px;border-radius:50%;
          background:#ef4444;color:#fff;font-size:11px;font-weight:800;
          display:flex;align-items:center;justify-content:center;
          border:2.5px solid #fff;
          animation:hgcPop .3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes hgcPop{from{transform:scale(0)}to{transform:scale(1)}}

        /* ── PANEL ── */
        .hgc-panel{
          position:fixed;bottom:100px;right:24px;z-index:9997;
          width:370px;max-width:calc(100vw - 32px);
          background:#fff;border-radius:20px;
          box-shadow:0 24px 80px rgba(11,31,58,.28);
          display:flex;flex-direction:column;overflow:hidden;
          animation:hgcSlide .35s cubic-bezier(.34,1.4,.64,1);
          max-height:540px;
        }
        @keyframes hgcSlide{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}

        /* ── HEADER ── */
        .hgc-hdr{
          background:linear-gradient(135deg,${NAVY},${NAVY2});
          padding:16px 18px;position:relative;overflow:hidden;flex-shrink:0;
        }
        .hgc-hdr::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(234,179,8,.08) 1px,transparent 1px);background-size:18px 18px}
        .hgc-hdr-inner{position:relative;z-index:1;display:flex;align-items:center;gap:10px}
        .hgc-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,${GOLD},${GOLD2});display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 12px rgba(234,179,8,.5)}
        .hgc-hdr-txt{flex:1}
        .hgc-hdr-name{font-family:'Sora',sans-serif;font-weight:800;font-size:14px;color:#fff;letter-spacing:-.01em}
        .hgc-hdr-status{font-size:11px;color:rgba(255,255,255,.55);display:flex;align-items:center;gap:5px;margin-top:2px}
        .hgc-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
        .hgc-close{background:rgba(255,255,255,.12);border:none;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);font-size:16px;transition:background .15s;flex-shrink:0}
        .hgc-close:hover{background:rgba(255,255,255,.22)}

        /* ── TABS ── */
        .hgc-tabs{display:flex;border-bottom:1.5px solid #f1f5f9;flex-shrink:0}
        .hgc-tab{flex:1;padding:11px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:700;color:#94a3b8;font-family:'DM Sans',sans-serif;transition:all .18s;border-bottom:2.5px solid transparent;margin-bottom:-1.5px}
        .hgc-tab.active{color:${NAVY};border-bottom-color:${GOLD}}

        /* ── FAQ ── */
        .hgc-faq{flex:1;overflow-y:auto;padding:12px}
        .hgc-faq::-webkit-scrollbar{width:4px}
        .hgc-faq::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
        .hgc-cat{margin-bottom:8px;border:1.5px solid #f1f5f9;border-radius:12px;overflow:hidden}
        .hgc-cat-hdr{width:100%;padding:11px 14px;border:none;background:#f8fafc;cursor:pointer;font-size:13px;font-weight:700;color:${NAVY};text-align:left;display:flex;align-items:center;justify-content:space-between;font-family:'DM Sans',sans-serif;transition:background .15s}
        .hgc-cat-hdr:hover{background:#f1f5f9}
        .hgc-cat-arrow{font-size:11px;color:#94a3b8;transition:transform .2s}
        .hgc-cat-arrow.open{transform:rotate(180deg)}
        .hgc-cat-items{padding:4px 0}
        .hgc-q{width:100%;padding:9px 14px;border:none;background:none;cursor:pointer;font-size:12.5px;color:#475569;text-align:left;font-family:'DM Sans',sans-serif;transition:background .15s;line-height:1.5;border-radius:0;display:flex;align-items:center;gap:8px}
        .hgc-q:hover{background:#fefce8;color:${NAVY}}
        .hgc-q::before{content:'→';color:${GOLD2};font-size:11px;flex-shrink:0}

        /* WhatsApp banner */
        .hgc-wa-banner{
          margin:12px 12px 4px;border-radius:12px;overflow:hidden;flex-shrink:0;
        }
        .hgc-wa-btn{
          display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;
          background:linear-gradient(135deg,#25D366,#128C7E);
          border:none;cursor:pointer;text-decoration:none;
          transition:opacity .18s;
        }
        .hgc-wa-btn:hover{opacity:.9}
        .hgc-wa-ico{font-size:20px;flex-shrink:0}
        .hgc-wa-txt{text-align:left}
        .hgc-wa-ttl{font-size:13px;font-weight:700;color:#fff;font-family:'DM Sans',sans-serif}
        .hgc-wa-sub{font-size:11px;color:rgba(255,255,255,.75);font-family:'DM Sans',sans-serif}

        /* ── CHAT ── */
        .hgc-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
        .hgc-msgs::-webkit-scrollbar{width:4px}
        .hgc-msgs::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
        .hgc-msg{display:flex;flex-direction:column;max-width:82%}
        .hgc-msg.bot{align-self:flex-start}
        .hgc-msg.user{align-self:flex-end}
        .hgc-bubble{padding:10px 13px;border-radius:16px;font-size:13px;line-height:1.6;color:${NAVY}}
        .hgc-msg.bot .hgc-bubble{background:#f1f5f9;border-bottom-left-radius:4px}
        .hgc-msg.user .hgc-bubble{background:linear-gradient(135deg,${GOLD},${GOLD2});border-bottom-right-radius:4px;font-weight:500}
        .hgc-time{font-size:10px;color:#94a3b8;margin-top:3px}
        .hgc-msg.user .hgc-time{text-align:right}

        /* Typing */
        .hgc-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#f1f5f9;border-radius:16px;border-bottom-left-radius:4px;width:fit-content}
        .hgc-typing span{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:hgcBounce 1.2s infinite}
        .hgc-typing span:nth-child(2){animation-delay:.2s}
        .hgc-typing span:nth-child(3){animation-delay:.4s}
        @keyframes hgcBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

        /* Input */
        .hgc-input-wrap{padding:10px 12px;border-top:1.5px solid #f1f5f9;display:flex;gap:8px;align-items:center;flex-shrink:0}
        .hgc-input{flex:1;padding:10px 13px;border:1.5px solid #e2e8f0;border-radius:22px;font-size:13px;font-family:'DM Sans',sans-serif;color:${NAVY};background:#f8fafc;outline:none;transition:border-color .18s}
        .hgc-input:focus{border-color:${NAVY};background:#fff}
        .hgc-send{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${GOLD},${GOLD2});border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s,opacity .2s}
        .hgc-send:hover:not(:disabled){transform:scale(1.1)}
        .hgc-send:disabled{opacity:.4;cursor:not-allowed}
        .hgc-send svg{width:16px;height:16px;fill:${NAVY}}

        /* Chat WA footer */
        .hgc-chat-wa{padding:8px 12px 10px;flex-shrink:0}
        .hgc-chat-wa a{display:flex;align-items:center;justify-content:center;gap:7px;padding:9px;background:linear-gradient(135deg,#25D366,#128C7E);border-radius:10px;text-decoration:none;transition:opacity .18s}
        .hgc-chat-wa a:hover{opacity:.9}
        .hgc-chat-wa-txt{font-size:12px;font-weight:700;color:#fff;font-family:'DM Sans',sans-serif}

        @media(max-width:400px){
          .hgc-panel{right:8px;bottom:90px;width:calc(100vw - 16px)}
          .hgc-fab{right:16px;bottom:16px}
        }
      `}</style>

      <div className="hgc">
        {/* ── FAB ── */}
        <button
          className={`hgc-fab ${open ? 'is-open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Open chat"
        >
          <span className="hgc-fab-ico">{open ? '✕' : '💬'}</span>
          {!open && unread > 0 && <span className="hgc-badge">{unread}</span>}
        </button>

        {/* ── PANEL ── */}
        {open && (
          <div className="hgc-panel">

            {/* Header */}
            <div className="hgc-hdr">
              <div className="hgc-hdr-inner">
                <div className="hgc-avatar">🎓</div>
                <div className="hgc-hdr-txt">
                  <div className="hgc-hdr-name">HandyBot · HandyGidi</div>
                  <div className="hgc-hdr-status">
                    <span className="hgc-dot" />
                    Online — usually replies instantly
                  </div>
                </div>
                <button className="hgc-close" onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="hgc-tabs">
              <button className={`hgc-tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>
                🙋 FAQ
              </button>
              <button className={`hgc-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
                💬 Ask a Question
              </button>
            </div>

            {/* ── FAQ TAB ── */}
            {tab === 'faq' && (
              <>
                <div className="hgc-faq">
                  {FAQS.map(f => (
                    <div key={f.category} className="hgc-cat">
                      <button
                        className="hgc-cat-hdr"
                        onClick={() => setOpenCat(openCat === f.category ? null : f.category)}
                      >
                        {f.category}
                        <span className={`hgc-cat-arrow ${openCat === f.category ? 'open' : ''}`}>▼</span>
                      </button>
                      {openCat === f.category && (
                        <div className="hgc-cat-items">
                          {f.items.map(item => (
                            <button
                              key={item.q}
                              className="hgc-q"
                              onClick={() => handleFaqClick(item.q, item.a)}
                            >
                              {item.q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* WhatsApp banner */}
                <div className="hgc-wa-banner">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="hgc-wa-btn">
                    <span className="hgc-wa-ico">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </span>
                    <div className="hgc-wa-txt">
                      <div className="hgc-wa-ttl">Chat with us on WhatsApp</div>
                      <div className="hgc-wa-sub">07051094001 · Instant replies</div>
                    </div>
                  </a>
                </div>
              </>
            )}

            {/* ── CHAT TAB ── */}
            {tab === 'chat' && (
              <>
                <div className="hgc-msgs">
                  {messages.map(m => (
                    <div key={m.id} className={`hgc-msg ${m.from}`}>
                      <div className="hgc-bubble">{m.text}</div>
                      <div className="hgc-time">{m.time}</div>
                    </div>
                  ))}
                  {typing && (
                    <div className="hgc-msg bot">
                      <div className="hgc-typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="hgc-input-wrap">
                  <input
                    ref={inputRef}
                    className="hgc-input"
                    placeholder="Type your question…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    disabled={typing}
                  />
                  <button
                    className="hgc-send"
                    onClick={() => send()}
                    disabled={!input.trim() || typing}
                  >
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>

                {/* WhatsApp footer in chat tab */}
                <div className="hgc-chat-wa">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span className="hgc-chat-wa-txt">Still need help? Chat on WhatsApp → 07051094001</span>
                  </a>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </>
  );
}
