import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import { BUSINESS_INFO } from "@/data/mockData";

export default function Register() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const whatsappEnroll = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(`Hello HandyGidi! My name is ${name || "[Your Name]"}. I'd like to register as a ${role}. Please send me enrollment details.`)}`;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const user = { email: "new@handygidi.com", role, name: name || "New Student" };
    localStorage.setItem("handygidi_user", JSON.stringify(user));
    toast.success("Account created successfully! Welcome to HandyGidi.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <img src={logo} alt="HandyGidi" className="w-10 h-10 rounded-lg object-contain" />
          <span className="font-heading font-bold text-lg text-foreground">HandyGidi</span>
        </Link>
        <h1 className="font-heading font-bold text-xl text-center mb-1 text-foreground">Create Account</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">Start your learning journey today</p>
        <form className="space-y-3" onSubmit={handleRegister}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
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
          <Button type="submit" className="w-full gradient-accent text-accent-foreground border-0" size="lg">
            Create Account
          </Button>
        </form>

        <div className="mt-4">
          <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 text-sm" asChild>
            <a href={whatsappEnroll} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} className="mr-2" /> Register via WhatsApp
            </a>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
