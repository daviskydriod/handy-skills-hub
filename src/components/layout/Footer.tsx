import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="gradient-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-heading font-bold text-sm">HG</span>
              </div>
              <span className="font-heading font-bold text-lg">HandyGidi</span>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Empowering individuals with practical, hands-on skills for a brighter future.
            </p>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <span className="flex items-center gap-2"><MapPin size={14} /> Lagos, Nigeria</span>
              <span className="flex items-center gap-2"><Phone size={14} /> +234 773 6681</span>
              <span className="flex items-center gap-2"><Mail size={14} /> info@handygidi.com</span>
            </div>
          </div>

          {[
            { title: "Programs", links: ["All Courses", "Graphic Design", "Web & Marketing", "Drone Training", "Event Decoration"] },
            { title: "Company", links: ["About Us", "Contact", "Careers", "Blog", "Press"] },
            { title: "Support", links: ["FAQ", "Help Center", "Privacy Policy", "Terms of Service", "Student Portal"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      {link}
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
