// File: frontend/src/pages/AdminRegister.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';

const NAVY  = '#0b1f3a';
const NAVY2 = '#0f2d56';
const GOLD  = '#EAB308';
const GOLD2 = '#CA8A04';

export default function AdminRegister() {
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [adminCode,    setAdminCode]    = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPass || !adminCode) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPass) {
      toast.error('Passwords do not match');
      return;
    }
    // Basic admin code check — replace with your real secret
    if (adminCode !== 'HANDYGIDI456') {
      toast.error('Invalid admin access code');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, 'admin');
      toast.success('Admin account created! Welcome, ' + name.split(' ')[0] + ' 🛡️');
      navigate('/dashboard/admin', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Registration failed — please try again';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg,#060d1c 0%,${NAVY} 60%,${NAVY2} 100%)` }}
    >
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAB308" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/4 translate-x-1/4 opacity-10 rounded-full"
          style={{ background: `radial-gradient(circle,${GOLD} 0%,transparent 70%)` }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Admin shield badge */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img src={logo} alt="HandyGidi" className="w-14 h-14 rounded-2xl object-contain"
                style={{ border: `2px solid rgba(234,179,8,0.4)` }} />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Shield size={12} style={{ color: '#060d1c' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-white text-base leading-tight">HandyGidi</p>
              <p className="text-[11px] font-semibold" style={{ color: GOLD }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(234,179,8,0.18)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Warning banner */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-6"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <Lock size={13} style={{ color: GOLD, flexShrink: 0 }} />
            <p className="text-[11px] font-semibold" style={{ color: 'rgba(234,179,8,0.9)' }}>
              Restricted area — authorised personnel only
            </p>
          </div>

          <h1 className="font-heading font-bold text-xl text-center mb-1 text-white">
            Create Admin Account
          </h1>
          <p className="text-center text-xs mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
            You need a valid admin access code to proceed
          </p>

          <form className="space-y-3" onSubmit={handleRegister}>
            {/* Full name */}
            <input
              placeholder="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            />

            {/* Email */}
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            />

            {/* Password */}
            <div className="relative">
              <input
                placeholder="Password (min 6 characters)"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                placeholder="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Admin access code */}
            <div className="relative">
              <input
                placeholder="Admin access code"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{
                  background: 'rgba(234,179,8,0.06)',
                  border: `1px solid rgba(234,179,8,0.25)`,
                  color: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.25)')}
              />
              <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: GOLD }} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-extrabold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
                color: '#060d1c',
                boxShadow: '0 6px 24px rgba(234,179,8,0.3)',
              }}
            >
              {isLoading ? 'Creating admin account…' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Already have an admin account?{' '}
              <Link to="/admin/login" className="font-semibold hover:underline" style={{ color: GOLD }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to main site */}
        <p className="text-center mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <Link to="/" className="hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Back to HandyGidi
          </Link>
        </p>
      </div>
    </div>
  );
}
