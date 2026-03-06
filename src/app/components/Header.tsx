import { Menu, X, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Browse Jobs", page: "browse-jobs" },
    { label: "For Drivers", page: "driver-registration" },
    { label: "For Companies", page: "company-job-posting" }
  ];

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="bg-accent p-2 rounded-lg">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-accent-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H7l5-5 5 5h-3v4z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold">EquipDriver</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`hover:text-accent transition-colors font-medium ${currentPage === link.page ? "text-accent" : ""
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => onNavigate("login")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => onNavigate("company-job-posting")}
            >
              Post a Job
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left hover:text-accent transition-colors ${currentPage === link.page ? "text-accent" : ""
                    }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-primary-foreground/20">
                <Button
                  className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => {
                    onNavigate("company-job-posting");
                    setMobileMenuOpen(false);
                  }}
                >
                  Post a Job
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

