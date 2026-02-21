import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [role, setRole] = useState("student");

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">HG</span>
          </div>
          <span className="font-heading font-bold text-lg text-foreground">HandyGidi</span>
        </Link>
        <h1 className="font-heading font-bold text-xl text-center mb-1 text-foreground">Create Account</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">Start your learning journey today</p>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Full Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input placeholder="Email address" type="email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input placeholder="Phone number" type="tel" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input placeholder="Password" type="password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input placeholder="Confirm Password" type="password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <div>
            <p className="text-xs text-muted-foreground mb-2">I am a:</p>
            <div className="flex gap-2">
              {["student", "instructor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    role === r ? "bg-accent text-accent-foreground border-accent" : "bg-background text-muted-foreground border-border"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full gradient-accent text-accent-foreground border-0" size="lg">
            Create Account
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
