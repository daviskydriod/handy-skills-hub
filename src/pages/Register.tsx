// File: frontend/src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [role,      setRole]      = useState<'student' | 'instructor'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created! Welcome to HandyGidi 🎉');
      // ✅ Paths match App.tsx route definitions exactly
      navigate(role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Registration failed — please try again';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <img src={logo} alt="HandyGidi" className="w-10 h-10 rounded-lg object-contain" />
          <span className="font-heading font-bold text-lg text-foreground">HandyGidi</span>
        </Link>

        <h1 className="font-heading font-bold text-xl text-center mb-1 text-foreground">
          Create Account
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Start your learning journey today
        </p>

        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            placeholder="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          />
          <input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          />
          <input
            placeholder="Password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          />

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            {(['student', 'instructor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 rounded-lg border text-sm font-semibold transition-all capitalize
                  ${role === r
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-700'
                    : 'border-border text-muted-foreground hover:border-yellow-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-accent text-accent-foreground border-0"
            size="lg"
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
