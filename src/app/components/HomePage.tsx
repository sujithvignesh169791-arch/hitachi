import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ShieldCheck,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  Search,
  Star,
  Quote
} from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-accent" />,
      title: "Verified Operators",
      description: "All drivers are background-checked with verified licenses and experience certificates."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Skilled Professionals",
      description: "Access to experienced operators for Excavators, JCB, Hitachi, and more heavy equipment."
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "Fast Hiring",
      description: "Post your requirement and get matched with qualified drivers within 24 hours."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent" />,
      title: "Secure Payments",
      description: "Safe and transparent payment system with full tracking and invoicing."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      icon: <FileCheck className="w-12 h-12 text-accent" />,
      title: "Register",
      description: "Companies post jobs, Drivers create profiles"
    },
    {
      step: "2",
      icon: <Search className="w-12 h-12 text-accent" />,
      title: "Match",
      description: "Our system matches the right driver to your job"
    },
    {
      step: "3",
      icon: <CheckCircle2 className="w-12 h-12 text-accent" />,
      title: "Verify",
      description: "Admin verifies credentials and approves matches"
    },
    {
      step: "4",
      icon: <TrendingUp className="w-12 h-12 text-accent" />,
      title: "Work",
      description: "Driver starts work, payments handled securely"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Construction Manager, BuildTech Pvt Ltd",
      image: "https://images.unsplash.com/photo-1542795126-6f5c1755a428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBJbmRpYW4lMjB3b3JrZXIlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzcyMDA5MzgzfDA&ixlib=rb-4.1.0&q=80&w=400",
      quote: "Found skilled JCB operators for our Mumbai project within hours. The verification process gave us complete confidence. Highly recommended!"
    },
    {
      name: "Amit Sharma",
      role: "Excavator Operator, 12 Years Experience",
      image: "https://images.unsplash.com/photo-1751054720514-067105f538d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWF2eSUyMGVxdWlwbWVudCUyMGNvbnN0cnVjdGlvbiUyMHdvcmtlcnxlbnwxfHx8fDE3NzIwMDkzODN8MA&ixlib=rb-4.1.0&q=80&w=400",
      quote: "This platform changed my career. I get consistent work, fair payment, and respect. No more searching for projects manually!"
    },
    {
      name: "Priya Patel",
      role: "Site Manager, Metro Construction",
      image: "https://images.unsplash.com/photo-1542795126-6f5c1755a428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBJbmRpYW4lMjB3b3JrZXIlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzcyMDA5MzgzfDA&ixlib=rb-4.1.0&q=80&w=400",
      quote: "The quality of operators and the ease of hiring is unmatched. EquipDriver has become our go-to platform for all machinery operator needs."
    }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1596112821147-f7b07d90fc1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBleGNhdmF0b3IlMjBzaXRlJTIwSW5kaWF8ZW58MXx8fHwxNzcyMDA5MzgyfDA&ixlib=rb-4.1.0&q=80&w=1080')"
          }}
        >
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Find Verified Heavy Equipment<br />Drivers Across India
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Fast Hiring. Verified Operators. Secure Payments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate("driver-registration")}
            >
              Register as Driver
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate("company-job-posting")}
            >
              Post a Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">5000+</div>
              <div className="text-sm md:text-base text-white/80">Verified Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">1200+</div>
              <div className="text-sm md:text-base text-white/80">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">15000+</div>
              <div className="text-sm md:text-base text-white/80">Jobs Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Why Choose EquipDriver?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              India's most trusted platform for connecting construction companies with skilled heavy equipment operators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-accent transition-colors hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple 4-step process to connect companies with verified operators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines (hidden on mobile) */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-accent/20" style={{ width: 'calc(100% - 120px)', left: '60px' }}></div>

            {howItWorks.map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-accent/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg relative z-10">
                  {item.icon}
                </div>
                <div className="bg-accent text-accent-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by thousands of companies and operators across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-accent transition-colors hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <Star className="w-5 h-5 fill-accent text-accent" />
                  </div>
                  <Quote className="w-10 h-10 text-accent/20 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-semibold text-primary">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of companies and operators who trust EquipDriver for their hiring needs
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate("driver-registration")}
            >
              Register as Driver
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate("company-job-posting")}
            >
              Post a Job
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
