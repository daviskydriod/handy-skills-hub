// File: frontend/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // After login, go back to where the user came from or their dashboard
  const from = (location.state as any)?.from?.pathname ?? null;

  // ✅ These paths must match your App.tsx route definitions exactly
  const getDefaultPath = (role: string) => {
    if (role === 'admin')      return '/dashboard/admin';
    if (role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);

      // Read role from localStorage (context state may not update synchronously)
      const stored = localStorage.getItem('hg_user');
      const role   = stored ? JSON.parse(stored).role : 'student';

      toast.success('Welcome back!');
      navigate(from ?? getDefaultPath(role), { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <img src={logo} alt="HandyGidi" className="w-10 h-10 rounded-lg object-contain" />
          <span className="font-heading font-bold text-lg text-foreground">HandyGidi</span>
        </Link>

        <h1 className="font-heading font-bold text-xl text-center mb-1 text-foreground">
          Welcome Back
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Sign in to continue learning
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50
                       disabled:opacity-50"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50
                       disabled:opacity-50"
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-accent text-accent-foreground border-0"
            size="lg"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
