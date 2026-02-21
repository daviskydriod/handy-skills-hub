import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">HG</span>
          </div>
          <span className="font-heading font-bold text-lg text-foreground">HandyGidi</span>
        </Link>
        <h1 className="font-heading font-bold text-xl text-center mb-1 text-foreground">Welcome Back</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">Sign in to continue learning</p>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Email address" type="email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input placeholder="Password" type="password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <div className="text-right">
            <Link to="#" className="text-xs text-accent hover:underline">Forgot Password?</Link>
          </div>
          <Button className="w-full gradient-accent text-accent-foreground border-0" size="lg" asChild>
            <Link to="/dashboard">Sign In</Link>
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
