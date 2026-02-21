import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { blogPosts } from "@/data/mockData";

export default function Blog() {
  return (
    <MainLayout>
      <section className="gradient-hero py-10 md:py-16">
        <div className="container text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-foreground">Blog & Insights</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Stories, tips, and inspiration from the HandyGidi community.</p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
                <img src={post.image} alt={post.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">{post.date} · {post.author}</p>
                  <h3 className="font-heading font-semibold text-card-foreground mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                  <Link to="#" className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
