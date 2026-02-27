// File: frontend/src/pages/Login.tsx
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
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from = (location.state as any)?.from?.pathname ?? null;

  const getDefaultPath = (role: string) => {
    if (role === 'admin')      return '/dashboard/admin';
    if (role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('hg_user');
      const role   = stored ? JSON.parse(stored).role : 'student';
      toast.success('Welcome back!');
      navigate(from ?? getDefaultPath(role), { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .hg-page {
          min-height: 100vh;
          background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 50%, #0a1628 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .hg-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(234,179,8,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .hg-page::after {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,179,8,0.12), transparent 70%);
          pointer-events: none;
        }
        .hg-card {
          width: 100%; max-width: 400px;
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
          position: relative; z-index: 1;
          animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .hg-logo-wrap {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          text-decoration: none; margin-bottom: 28px;
        }
        .hg-logo-img {
          width: 44px; height: 44px; border-radius: 12px;
          object-fit: contain;
          border: 2px solid ${GOLD}40;
          box-shadow: 0 2px 12px ${GOLD}30;
        }
        .hg-logo-text {
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: 18px; color: ${NAVY};
        }
        .hg-title {
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: 22px; color: ${NAVY};
          text-align: center; margin-bottom: 4px;
        }
        .hg-subtitle {
          text-align: center; font-size: 13.5px; color: #64748b;
          margin-bottom: 28px;
        }
        .hg-label {
          display: block; font-size: 12px; font-weight: 700;
          color: ${NAVY}; margin-bottom: 6px; letter-spacing: 0.02em;
        }
        .hg-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: ${NAVY}; background: #f8fafc;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .hg-input:focus {
          border-color: ${NAVY}; background: #fff;
          box-shadow: 0 0 0 3px ${NAVY}15;
        }
        .hg-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .hg-input::placeholder { color: #94a3b8; }
        .hg-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, ${GOLD}, ${GOLD2});
          color: ${NAVY}; font-size: 14px; font-weight: 800;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; margin-top: 4px;
        }
        .hg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px ${GOLD}60;
        }
        .hg-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .hg-forgot { text-align: right; margin-bottom: 16px; }
        .hg-forgot a {
          font-size: 12px; color: ${GOLD2}; font-weight: 600;
          text-decoration: none;
        }
        .hg-forgot a:hover { text-decoration: underline; }
        .hg-bottom {
          text-align: center; font-size: 13px; color: #64748b; margin-top: 22px;
        }
        .hg-bottom a {
          color: ${NAVY2}; font-weight: 700; text-decoration: none;
        }
        .hg-bottom a:hover { text-decoration: underline; }
        .hg-divider {
          display: flex; align-items: center; gap: 10px; margin: 20px 0;
        }
        .hg-divider::before, .hg-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .hg-divider span { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }
        .hg-field { margin-bottom: 16px; }
      `}</style>

      <div className="hg-page">
        <div className="hg-card">

          {/* Logo */}
          <Link to="/" className="hg-logo-wrap">
            <img src={logo} alt="HandyGidi" className="hg-logo-img" />
            <span className="hg-logo-text">HandyGidi</span>
          </Link>

          <h1 className="hg-title">Welcome Back</h1>
          <p className="hg-subtitle">Sign in to continue learning</p>

          <form onSubmit={handleLogin}>
            <div className="hg-field">
              <label className="hg-label">Email Address</label>
              <input
                className="hg-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="hg-field">
              <label className="hg-label">Password</label>
              <input
                className="hg-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="hg-forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="hg-btn" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="hg-bottom">
            Don't have an account?{' '}
            <Link to="/register">Register Free</Link>
          </p>
        </div>
      </div>
    </>
  );
}
