// File: src/pages/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import { resetPassword } from '@/api/auth';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

const STR_LABEL = ['Too short','Weak','Fair','Good','Strong'];
const STR_COLOR = ['#ef4444','#f97316','#eab308','#22c55e','#16a34a'];

function pwStrength(p: string) {
  let s = 0;
  if (p.length >= 8)          s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0–4
}

export default function ResetPassword() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token') ?? '';

  const [pw,       setPw]       = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [tokenErr, setTokenErr] = useState('');

  useEffect(() => {
    if (!token) setTokenErr('Missing reset token. Please request a new link.');
  }, [token]);

  const strength = pwStrength(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8)    { toast.error('Password must be at least 8 characters'); return; }
    if (strength < 2)     { toast.error('Please choose a stronger password'); return; }
    if (pw !== confirm)   { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await resetPassword(token, pw);
      setDone(true);
      toast.success('Password updated!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Something went wrong.';
      toast.error(msg);
      if (/expired|invalid/i.test(msg)) setTokenErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .rp-page{
          min-height:100vh;
          background:linear-gradient(135deg,${NAVY} 0%,${NAVY2} 55%,#071525 100%);
          display:flex;align-items:center;justify-content:center;
          padding:16px;font-family:'DM Sans',sans-serif;
          position:relative;overflow:hidden;
        }
        .rp-page::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(234,179,8,.07) 1px,transparent 1px);background-size:26px 26px;pointer-events:none}
        .rp-glow{position:absolute;top:-160px;right:-160px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(234,179,8,.12),transparent 68%);pointer-events:none}

        .rp-card{
          width:100%;max-width:420px;background:#fff;
          border-radius:24px;padding:40px 36px;
          box-shadow:0 32px 80px rgba(0,0,0,.42);
          position:relative;z-index:1;
          animation:rpIn .5s cubic-bezier(.34,1.4,.64,1);
        }
        @keyframes rpIn{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}

        .rp-logo    {display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;margin-bottom:28px}
        .rp-logo img{width:46px;height:46px;border-radius:12px;object-fit:contain;border:2px solid ${GOLD}55;box-shadow:0 2px 14px ${GOLD}38}
        .rp-ln      {font-family:'Sora',sans-serif;font-weight:900;font-size:19px;color:${NAVY};letter-spacing:-.02em;line-height:1}
        .rp-lt      {font-size:9px;font-weight:700;color:${GOLD2};letter-spacing:.09em;text-transform:uppercase;margin-top:2px}

        .rp-h1 {font-family:'Sora',sans-serif;font-weight:900;font-size:23px;color:${NAVY};text-align:center;margin-bottom:4px;letter-spacing:-.02em}
        .rp-sub{text-align:center;font-size:13.5px;color:#64748b;margin-bottom:28px}

        .rp-field{margin-bottom:18px}
        .rp-label{display:block;font-size:12px;font-weight:700;color:${NAVY};margin-bottom:7px}
        .rp-rel  {position:relative}
        .rp-input{
          width:100%;padding:12px 44px 12px 14px;
          border:1.5px solid #e2e8f0;border-radius:12px;
          font-size:14px;font-family:'DM Sans',sans-serif;
          color:${NAVY};background:#f8fafc;outline:none;transition:all .2s;
        }
        .rp-input:focus       {border-color:${NAVY};background:#fff;box-shadow:0 0 0 3px ${NAVY}18}
        .rp-input::placeholder{color:#94a3b8}
        .rp-input.err         {border-color:#ef4444!important}
        .rp-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;font-size:16px;padding:4px;line-height:1;transition:color .15s}
        .rp-eye:hover{color:${NAVY}}

        /* Password strength */
        .rp-bars{display:flex;gap:4px;margin-top:8px;margin-bottom:4px}
        .rp-seg {height:4px;border-radius:99px;flex:1;transition:background .3s}
        .rp-slbl{font-size:11px;font-weight:700}
        .rp-emsg{font-size:11px;color:#ef4444;margin-top:5px;font-weight:600}

        .rp-btn{
          width:100%;padding:14px;
          background:linear-gradient(135deg,${GOLD},${GOLD2});
          color:${NAVY};font-size:15px;font-weight:800;
          font-family:'DM Sans',sans-serif;
          border:none;border-radius:12px;cursor:pointer;
          transition:all .22s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .rp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 26px ${GOLD}65}
        .rp-btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important}

        @keyframes rpSpin{to{transform:rotate(360deg)}}
        .rp-spin{width:16px;height:16px;border-radius:50%;border:2px solid ${NAVY}35;border-top-color:${NAVY};animation:rpSpin .7s linear infinite}

        .rp-back   {text-align:center;font-size:13.5px;color:#64748b;margin-top:20px}
        .rp-back a {color:${NAVY};font-weight:700;text-decoration:none}
        .rp-back a:hover{text-decoration:underline}

        /* Error state */
        .rp-err-box {background:#fff1f2;border:1.5px solid #fecdd3;border-radius:16px;padding:24px;text-align:center}
        .rp-err-ico {font-size:40px;margin-bottom:14px}
        .rp-err-h   {font-family:'Sora',sans-serif;font-weight:800;font-size:18px;color:#be123c;margin-bottom:8px}
        .rp-err-txt {font-size:13.5px;color:#64748b;line-height:1.65;margin-bottom:18px}
        .rp-err-btn {display:inline-block;padding:11px 24px;background:linear-gradient(135deg,${GOLD},${GOLD2});color:${NAVY};font-weight:800;border-radius:10px;text-decoration:none;font-size:13px}

        /* Done state */
        .rp-done    {text-align:center;animation:rpIn .4s ease}
        .rp-done-ico{width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border:2px solid #86efac;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 18px}
        .rp-done-h  {font-family:'Sora',sans-serif;font-weight:900;font-size:22px;color:${NAVY};margin-bottom:10px}
        .rp-done-txt{font-size:14px;color:#475569;line-height:1.75;margin-bottom:22px}
        .rp-done-btn{display:inline-block;padding:13px 32px;background:linear-gradient(135deg,${GOLD},${GOLD2});color:${NAVY};font-size:14px;font-weight:800;border-radius:12px;text-decoration:none;transition:all .2s}
        .rp-done-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px ${GOLD}65}
      `}</style>

      <div className="rp-page">
        <div className="rp-glow" />
        <div className="rp-card">

          <Link to="/" className="rp-logo">
            <img src={logo} alt="HandyGidi" />
            <div>
              <div className="rp-ln">HandyGidi</div>
              <div className="rp-lt">Training Centre</div>
            </div>
          </Link>

          {/* ── Expired / invalid token ── */}
          {tokenErr ? (
            <div className="rp-err-box">
              <div className="rp-err-ico">⛔</div>
              <div className="rp-err-h">Link Expired or Invalid</div>
              <p className="rp-err-txt">{tokenErr}</p>
              <Link to="/forgot-password" className="rp-err-btn">Request New Link →</Link>
            </div>

          ) : done ? (
            /* ── Success ── */
            <div className="rp-done">
              <div className="rp-done-ico">✅</div>
              <div className="rp-done-h">Password Updated!</div>
              <p className="rp-done-txt">Your password has been reset. Redirecting you to login…</p>
              <Link to="/login" className="rp-done-btn">Go to Login →</Link>
            </div>

          ) : (
            /* ── Form ── */
            <>
              <h1 className="rp-h1">Reset Password</h1>
              <p className="rp-sub">Create a strong new password for your account</p>

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <div className="rp-field">
                  <label className="rp-label">New Password</label>
                  <div className="rp-rel">
                    <input className="rp-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={pw} onChange={e => setPw(e.target.value)}
                      disabled={loading} autoFocus />
                    <button type="button" className="rp-eye"
                      onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {pw && (
                    <>
                      <div className="rp-bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="rp-seg"
                            style={{ background: strength >= i ? STR_COLOR[strength] : '#e2e8f0' }} />
                        ))}
                      </div>
                      <span className="rp-slbl" style={{ color: STR_COLOR[strength] }}>
                        {STR_LABEL[strength]}
                      </span>
                    </>
                  )}
                </div>

                {/* Confirm password */}
                <div className="rp-field">
                  <label className="rp-label">Confirm New Password</label>
                  <div className="rp-rel">
                    <input
                      className={`rp-input${confirm && confirm !== pw ? ' err' : ''}`}
                      type={showCf ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      disabled={loading} />
                    <button type="button" className="rp-eye"
                      onClick={() => setShowCf(s => !s)} tabIndex={-1}>
                      {showCf ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirm && confirm !== pw && (
                    <p className="rp-emsg">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading
                    ? <><div className="rp-spin" />Saving…</>
                    : <>Set New Password →</>}
                </button>
              </form>

              <p className="rp-back"><Link to="/login">← Back to Login</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
