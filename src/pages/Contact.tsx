import { Mail, Phone, MapPin, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { BUSINESS_INFO } from "@/data/mockData";

const whatsappMsg = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent("Hello HandyGidi! I have a question.")}`;

export default function Contact() {
  return (
    <MainLayout>
      <section className="gradient-hero py-10 md:py-16">
        <div className="container text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3 text-foreground">Contact Us</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Have questions? We'd love to hear from you. Visit us in Lugbe, Abuja or send a message.</p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-heading font-semibold text-xl mb-6 text-foreground">Send us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <input placeholder="Your Email" type="email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <textarea placeholder="Your Message" rows={5} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
              <Button className="gradient-accent text-accent-foreground border-0 w-full">Send Message</Button>
            </form>
            <div className="mt-4">
              <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50" asChild>
                <a href={whatsappMsg} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} className="mr-2" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-xl mb-6 text-foreground">Get in Touch</h2>
            <div className="space-y-4 mb-8">
              {[
                { icon: MapPin, label: "Address", value: BUSINESS_INFO.address },
                { icon: Phone, label: "Phone / WhatsApp", value: BUSINESS_INFO.phone },
                { icon: Mail, label: "Email", value: BUSINESS_INFO.email },
                { icon: Instagram, label: "Instagram", value: "@Handygiditrainingcentre" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg overflow-hidden h-48">
              <iframe
                title="HandyGidi Location"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${BUSINESS_INFO.mapQuery}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
