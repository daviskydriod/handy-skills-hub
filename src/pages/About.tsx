import { CheckCircle, Target, Eye } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { teamMembers } from "@/data/mockData";

export default function About() {
  return (
    <MainLayout>
      <section className="gradient-hero py-10 md:py-16">
        <div className="container text-center max-w-2xl mx-auto">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-foreground">About HandyGidi Training Centre</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Training Today for Tomorrow's Future — equipping individuals with practical digital, business, and leadership skills that lead to real income and career opportunities.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
            <h2 className="font-heading font-bold text-xl mb-4 text-card-foreground">Our Story</h2>
            <p className="text-sm text-muted-foreground mb-4">
              HANDY GIDI Training Centre was founded with a clear mission: to equip individuals with practical digital, business, and leadership skills that lead to real income and career opportunities.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Located in Lugbe, Abuja, we focus on hands-on training, small class sizes, and real-world projects so our students don't just learn — they become job-ready and business-ready.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Our programs are designed for: students, job seekers, entrepreneurs, working professionals, women, and young people who want to build valuable skills for today's digital economy.
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              At HANDY GIDI, we don't just teach — we empower, mentor, and help you unlock your full potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Target size={22} className="text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                To provide accessible, high-quality practical training that equips learners with the skills they need to thrive in today's digital economy — regardless of their background or previous education.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Eye size={22} className="text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground">Our Vision</h3>
              <p className="text-sm text-muted-foreground">
                To become Nigeria's leading practical training centre, known for transforming lives through hands-on education and fostering a new generation of skilled professionals and entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10 text-foreground">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((m) => (
              <div key={m.name} className="bg-card border border-border rounded-lg p-5 text-center">
                <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                <h3 className="font-heading font-semibold text-sm text-card-foreground">{m.name}</h3>
                <p className="text-accent text-xs font-medium mb-1">{m.role}</p>
                <p className="text-xs text-muted-foreground">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-primary py-10 md:py-14">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary-foreground">
          {[
            { value: "5+", label: "Years Running" },
            { value: "500+", label: "Graduates" },
            { value: "14+", label: "Programs" },
            { value: "95%", label: "Satisfaction Rate" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading font-extrabold text-3xl md:text-4xl mb-1">{s.value}</p>
              <p className="text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
