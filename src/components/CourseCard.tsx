import { Link } from "react-router-dom";
import { Star, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  lessons: number;
  duration: string;
  instructor: string;
  image: string;
}

export default function CourseCard({ id, title, category, price, rating, lessons, duration, instructor, image }: CourseCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden aspect-video">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-sm mb-2 line-clamp-2 text-card-foreground">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Star size={12} className="text-accent fill-accent" /> {rating}</span>
          <span className="flex items-center gap-1"><BookOpen size={12} /> {lessons} lessons</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {duration}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <img src={`https://picsum.photos/seed/${instructor}/32/32`} alt={instructor} className="w-6 h-6 rounded-full" />
          <span className="text-xs text-muted-foreground">{instructor}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-foreground">₦{price.toLocaleString()}</span>
          <Button size="sm" className="gradient-accent text-accent-foreground border-0 text-xs" asChild>
            <Link to={`/courses/${id}`}>Enroll Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
