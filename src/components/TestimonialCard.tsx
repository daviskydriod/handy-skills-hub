import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

export default function TestimonialCard({ name, role, quote, rating, avatar }: TestimonialCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < rating ? "text-accent fill-accent" : "text-muted"} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-4 flex-1 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-heading font-semibold text-sm text-card-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}
