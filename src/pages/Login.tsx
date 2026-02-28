// File: src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname ?? null;

  const getDefaultPath = (role: string) => {
    if (role === 'admin')      return '/dashboard/admin';
    if (role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('hg_user');
      const role   = stored ? JSON.parse(stored).role : 'student';
      toast.success('Welcome back!');
      navigate(from ?? getDefaultPath(role), { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .lg-page{
          min-height:100vh;
          background:linear-gradient(135deg,${NAVY} 0%,${NAVY2} 55%,#071525 100%);
          display:flex;align-items:center;justify-content:center;
          padding:16px;font-family:'DM Sans',sans-serif;
          position:relative;overflow:hidden;
        }
        .lg-page::before{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,rgba(234,179,8,.07) 1px,transparent 1px);
          background-size:26px 26px;pointer-events:none;
        }
        .lg-g1{position:absolute;top:-160px;right:-160px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(234,179,8,.12),transparent 68%);pointer-events:none}
        .lg-g2{position:absolute;bottom:-100px;left:-100px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(15,45,86,.5),transparent 70%);pointer-events:none}

        .lg-card{
          width:100%;max-width:420px;background:#fff;
          border-radius:24px;padding:40px 36px;
          box-shadow:0 32px 80px rgba(0,0,0,.42);
          position:relative;z-index:1;
          animation:lgIn .5s cubic-bezier(.34,1.4,.64,1);
        }
        @keyframes lgIn{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}

        .lg-logo    {display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;margin-bottom:30px}
        .lg-logo img{width:46px;height:46px;border-radius:12px;object-fit:contain;border:2px solid ${GOLD}55;box-shadow:0 2px 14px ${GOLD}38}
        .lg-ln      {font-family:'Sora',sans-serif;font-weight:900;font-size:19px;color:${NAVY};letter-spacing:-.02em;line-height:1}
        .lg-lt      {font-size:9px;font-weight:700;color:${GOLD2};letter-spacing:.09em;text-transform:uppercase;margin-top:2px}

        .lg-h1 {font-family:'Sora',sans-serif;font-weight:900;font-size:24px;color:${NAVY};text-align:center;margin-bottom:4px;letter-spacing:-.02em}
        .lg-sub{text-align:center;font-size:14px;color:#64748b;margin-bottom:30px}

        .lg-field{margin-bottom:18px}
        .lg-label{display:block;font-size:12px;font-weight:700;color:${NAVY};margin-bottom:7px}
        .lg-rel  {position:relative}
        .lg-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #e2e8f0;border-radius:12px;
          font-size:14px;font-family:'DM Sans',sans-serif;
          color:${NAVY};background:#f8fafc;
          outline:none;transition:all .2s;
        }
        .lg-input:focus       {border-color:${NAVY};background:#fff;box-shadow:0 0 0 3px ${NAVY}18}
        .lg-input:disabled    {opacity:.5;cursor:not-allowed}
        .lg-input::placeholder{color:#94a3b8}
        .lg-input.pr          {padding-right:44px}
        .lg-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;font-size:16px;padding:4px;line-height:1;transition:color .15s}
        .lg-eye:hover{color:${NAVY}}

        .lg-forgot  {text-align:right;margin-top:-10px;margin-bottom:20px}
        .lg-forgot a{font-size:12px;font-weight:700;color:${GOLD2};text-decoration:none}
        .lg-forgot a:hover{text-decoration:underline}

        .lg-btn{
          width:100%;padding:14px;
          background:linear-gradient(135deg,${GOLD},${GOLD2});
          color:${NAVY};font-size:15px;font-weight:800;
          font-family:'DM Sans',sans-serif;letter-spacing:.02em;
          border:none;border-radius:12px;cursor:pointer;
          transition:all .22s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .lg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 26px ${GOLD}65}
        .lg-btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important;box-shadow:none!important}

        @keyframes lgSpin{to{transform:rotate(360deg)}}
        .lg-spin{width:16px;height:16px;border-radius:50%;border:2px solid ${NAVY}35;border-top-color:${NAVY};animation:lgSpin .7s linear infinite}

        .lg-foot   {text-align:center;font-size:13.5px;color:#64748b;margin-top:22px}
        .lg-foot a {color:${NAVY};font-weight:700;text-decoration:none}
        .lg-foot a:hover{text-decoration:underline}

        .lg-trust{display:flex;justify-content:center;gap:14px;margin-top:20px;flex-wrap:wrap}
        .lg-badge{font-size:11px;color:#94a3b8;font-weight:500}
      `}</style>

      <div className="lg-page">
        <div className="lg-g1" /><div className="lg-g2" />
        <div className="lg-card">

          <Link to="/" className="lg-logo">
            <img src={logo} alt="HandyGidi" />
            <div>
              <div className="lg-ln">HandyGidi</div>
              <div className="lg-lt">Training Centre</div>
            </div>
          </Link>

          <h1 className="lg-h1">Welcome Back</h1>
          <p className="lg-sub">Sign in to continue your learning journey</p>

          <form onSubmit={handleLogin}>
            <div className="lg-field">
              <label className="lg-label">Email Address</label>
              <div className="lg-rel">
                <input className="lg-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={loading} autoComplete="email" />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-rel">
                <input className={`lg-input pr`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={loading} autoComplete="current-password" />
                <button type="button" className="lg-eye"
                  onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="lg-forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading
                ? <><div className="lg-spin" />Signing in…</>
                : <>Sign In →</>}
            </button>
          </form>

          <p className="lg-foot">
            Don't have an account? <Link to="/register">Register Free</Link>
          </p>

          <div className="lg-trust">
            <span className="lg-badge">🔒 Secure Login</span>
            <span className="lg-badge">⭐ 500+ Graduates</span>
            <span className="lg-badge">📍 Lugbe, Abuja</span>
          </div>

        </div>
      </div>
    </>
  );
}
