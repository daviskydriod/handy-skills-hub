import { useState } from "react";
import { Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import CourseCard from "@/components/CourseCard";
import { courses, categories } from "@/data/mockData";

export default function Courses() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) => {
    const matchCat = filter === "All" || c.category === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <MainLayout>
      <section className="gradient-hero py-10 md:py-14">
        <div className="container text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-foreground">Our Courses</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Discover practical, hands-on courses designed to help you build real skills and earn a living. All prices in Nigerian Naira (₦). Flexible payment plans available.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filter === cat
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:border-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No courses found matching your criteria.</p>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
