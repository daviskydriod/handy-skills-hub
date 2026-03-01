import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { BUSINESS_INFO } from "@/data/mockData";

export default function Footer() {
  return (
    <footer className="gradient-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="HandyGidi" className="w-10 h-10 rounded-lg object-contain bg-white/90" />
              <div>
                <span className="font-heading font-bold text-lg block leading-tight">HandyGidi</span>
                <span className="text-xs opacity-70">{BUSINESS_INFO.tagline}</span>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Empowering individuals with practical digital, business, and leadership skills for real income and career opportunities.
            </p>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <span className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {BUSINESS_INFO.address}</span>
              <span className="flex items-center gap-2"><Phone size={14} /> {BUSINESS_INFO.phone}</span>
              <span className="flex items-center gap-2"><Mail size={14} /> {BUSINESS_INFO.email}</span>
              <a href={BUSINESS_INFO.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                <Instagram size={14} /> @Handygiditrainingcentre
              </a>
            </div>
          </div>

          {[
            { title: "Programs", links: [
              { label: "All Courses", to: "/courses" },
              { label: "Graphic Design", to: "/courses" },
              { label: "Web Design", to: "/courses" },
              { label: "AI & Data Analysis", to: "/courses" },
              { label: "Digital Marketing", to: "/courses" },
            ]},
            { title: "Company", links: [
              { label: "About Us", to: "/about" },
              { label: "Contact", to: "/contact" },
              { label: "Blog", to: "/blog" },
              { label: "Careers", to: "/contact" },
            ]},
            { title: "Support", links: [
              { label: "FAQ", to: "/contact" },
              { label: "Student Portal", to: "/login" },
              { label: "Privacy Policy", to: "#" },
              { label: "Terms of Service", to: "#" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-sm opacity-60">
          © 2026 HandyGidi Training Centre. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
