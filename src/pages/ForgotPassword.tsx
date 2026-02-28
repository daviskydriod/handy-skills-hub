// File: src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import axios from 'axios';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

// !! Change this to match where your PHP files actually live on cPanel !!
const API = 'https://handygiditrainingcentre.com/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Invalid email address'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/forgot-password.php`, { email });
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .fp-page{
          min-height:100vh;
          background:linear-gradient(135deg,${NAVY} 0%,${NAVY2} 55%,#071525 100%);
          display:flex;align-items:center;justify-content:center;
          padding:16px;font-family:'DM Sans',sans-serif;
          position:relative;overflow:hidden;
        }
        .fp-page::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(234,179,8,.07) 1px,transparent 1px);background-size:26px 26px;pointer-events:none}
        .fp-glow{position:absolute;top:-160px;right:-160px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(234,179,8,.12),transparent 68%);pointer-events:none}

        .fp-card{
          width:100%;max-width:420px;background:#fff;
          border-radius:24px;padding:40px 36px;
          box-shadow:0 32px 80px rgba(0,0,0,.42);
          position:relative;z-index:1;
          animation:fpIn .5s cubic-bezier(.34,1.4,.64,1);
        }
        @keyframes fpIn{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}

        .fp-logo    {display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;margin-bottom:28px}
        .fp-logo img{width:46px;height:46px;border-radius:12px;object-fit:contain;border:2px solid ${GOLD}55;box-shadow:0 2px 14px ${GOLD}38}
        .fp-ln      {font-family:'Sora',sans-serif;font-weight:900;font-size:19px;color:${NAVY};letter-spacing:-.02em;line-height:1}
        .fp-lt      {font-size:9px;font-weight:700;color:${GOLD2};letter-spacing:.09em;text-transform:uppercase;margin-top:2px}

        .fp-h1 {font-family:'Sora',sans-serif;font-weight:900;font-size:23px;color:${NAVY};text-align:center;margin-bottom:4px;letter-spacing:-.02em}
        .fp-sub{text-align:center;font-size:13.5px;color:#64748b;margin-bottom:28px;line-height:1.65}

        .fp-label{display:block;font-size:12px;font-weight:700;color:${NAVY};margin-bottom:7px}
        .fp-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #e2e8f0;border-radius:12px;
          font-size:14px;font-family:'DM Sans',sans-serif;
          color:${NAVY};background:#f8fafc;outline:none;transition:all .2s;
        }
        .fp-input:focus      {border-color:${NAVY};background:#fff;box-shadow:0 0 0 3px ${NAVY}18}
        .fp-input::placeholder{color:#94a3b8}

        .fp-btn{
          width:100%;padding:14px;margin-top:18px;
          background:linear-gradient(135deg,${GOLD},${GOLD2});
          color:${NAVY};font-size:15px;font-weight:800;
          font-family:'DM Sans',sans-serif;
          border:none;border-radius:12px;cursor:pointer;
          transition:all .22s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .fp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 26px ${GOLD}65}
        .fp-btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important}

        @keyframes fpSpin{to{transform:rotate(360deg)}}
        .fp-spin{width:16px;height:16px;border-radius:50%;border:2px solid ${NAVY}35;border-top-color:${NAVY};animation:fpSpin .7s linear infinite}

        .fp-back   {text-align:center;font-size:13.5px;color:#64748b;margin-top:20px}
        .fp-back a {color:${NAVY};font-weight:700;text-decoration:none}
        .fp-back a:hover{text-decoration:underline}

        /* Success state */
        .fp-ok      {text-align:center;animation:fpIn .4s ease}
        .fp-ok-icon {width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,${GOLD}28,${GOLD}10);border:2px solid ${GOLD}48;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px}
        .fp-ok-h    {font-family:'Sora',sans-serif;font-weight:900;font-size:22px;color:${NAVY};margin-bottom:10px}
        .fp-ok-txt  {font-size:14px;color:#475569;line-height:1.75;margin-bottom:22px}
        .fp-ok-em   {font-weight:700;color:${NAVY}}

        .fp-ibox    {background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px 18px;text-align:left;margin-bottom:22px}
        .fp-irow    {display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13px;color:#475569;line-height:1.55}
        .fp-irow:last-child{margin-bottom:0}
        .fp-ico     {font-size:15px;flex-shrink:0;margin-top:1px}

        .fp-retry{background:none;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;width:100%;margin-bottom:12px}
        .fp-retry:hover{border-color:${NAVY};color:${NAVY}}
      `}</style>

      <div className="fp-page">
        <div className="fp-glow" />
        <div className="fp-card">

          <Link to="/" className="fp-logo">
            <img src={logo} alt="HandyGidi" />
            <div>
              <div className="fp-ln">HandyGidi</div>
              <div className="fp-lt">Training Centre</div>
            </div>
          </Link>

          {sent ? (
            <div className="fp-ok">
              <div className="fp-ok-icon">📬</div>
              <h2 className="fp-ok-h">Email Sent!</h2>
              <p className="fp-ok-txt">
                We sent a reset link to <span className="fp-ok-em">{email}</span>.
                It expires in <strong>30 minutes</strong>.
              </p>
              <div className="fp-ibox">
                <div className="fp-irow"><span className="fp-ico">📁</span><span>Check your <strong>spam / junk folder</strong> too.</span></div>
                <div className="fp-irow"><span className="fp-ico">⏰</span><span>Link is valid for <strong>30 minutes</strong> only.</span></div>
                <div className="fp-irow"><span className="fp-ico">📞</span><span>Still need help? Call <strong>07051094001</strong></span></div>
              </div>
              <button className="fp-retry" onClick={() => setSent(false)}>↺ Try a different email</button>
              <div className="fp-back"><Link to="/login">← Back to Login</Link></div>
            </div>
          ) : (
            <>
              <h1 className="fp-h1">Forgot Password?</h1>
              <p className="fp-sub">Enter your registered email and we'll send you a secure reset link.</p>
              <form onSubmit={handleSubmit}>
                <label className="fp-label">Email Address</label>
                <input className="fp-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={loading} autoComplete="email" autoFocus />
                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? <><div className="fp-spin" /> Sending…</> : <>Send Reset Link →</>}
                </button>
              </form>
              <p className="fp-back">Remembered it? <Link to="/login">Back to Login</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
