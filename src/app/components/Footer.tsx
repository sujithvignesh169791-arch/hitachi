import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-accent p-2 rounded-lg">
                <svg 
                  className="w-6 h-6 text-accent-foreground" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H7l5-5 5 5h-3v4z"/>
                </svg>
              </div>
              <span className="text-xl font-bold">EquipDriver</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              India's trusted platform connecting construction companies with verified heavy equipment operators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Find Drivers
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">+91 98765 43210</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">support@equipdriver.in</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">Mumbai, Maharashtra, India</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className="bg-accent p-2 rounded-lg hover:bg-accent/90 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-accent-foreground" />
              </a>
              <a 
                href="#" 
                className="bg-accent p-2 rounded-lg hover:bg-accent/90 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-accent-foreground" />
              </a>
              <a 
                href="#" 
                className="bg-accent p-2 rounded-lg hover:bg-accent/90 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-accent-foreground" />
              </a>
              <a 
                href="#" 
                className="bg-accent p-2 rounded-lg hover:bg-accent/90 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-accent-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} EquipDriver. All rights reserved. | Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
