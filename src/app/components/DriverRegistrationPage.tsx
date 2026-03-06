import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, CheckCircle2, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface DriverRegistrationPageProps {
  onNavigate: (page: string) => void;
}

export function DriverRegistrationPage({ onNavigate }: DriverRegistrationPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    location: "",
    licenseNumber: "",
    experience: "",
    machineType: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration submitted successfully! Our team will verify your documents and contact you soon.");
    setTimeout(() => {
      onNavigate("driver-dashboard");
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <UserCheck className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Driver Registration
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Join India's largest network of verified heavy equipment operators. Get access to quality jobs and secure payments.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-accent text-2xl font-bold mb-2">₹25,000+</div>
              <div className="text-sm text-muted-foreground">Average Monthly Earnings</div>
            </div>
            <div>
              <div className="text-accent text-2xl font-bold mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Active Jobs Daily</div>
            </div>
            <div>
              <div className="text-accent text-2xl font-bold mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Secure Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl text-primary">Driver Registration Form</CardTitle>
              <CardDescription>
                Fill in your details to create your operator profile. All fields are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                    className="border-2 focus:border-accent"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    required
                    className="border-2 focus:border-accent"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City, State) *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                    className="border-2 focus:border-accent"
                  />
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Driving License Number *</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange("licenseNumber", e.target.value)}
                    required
                    className="border-2 focus:border-accent"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select 
                    value={formData.experience} 
                    onValueChange={(value) => handleChange("experience", value)}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-accent">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 Years</SelectItem>
                      <SelectItem value="3-5">3-5 Years</SelectItem>
                      <SelectItem value="6-10">6-10 Years</SelectItem>
                      <SelectItem value="10+">10+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Machine Type */}
                <div className="space-y-2">
                  <Label htmlFor="machineType">Machine Type / Specialization *</Label>
                  <Select 
                    value={formData.machineType} 
                    onValueChange={(value) => handleChange("machineType", value)}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-accent">
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excavator">Excavator</SelectItem>
                      <SelectItem value="jcb">JCB</SelectItem>
                      <SelectItem value="hitachi">Hitachi</SelectItem>
                      <SelectItem value="bulldozer">Bulldozer</SelectItem>
                      <SelectItem value="crane">Crane</SelectItem>
                      <SelectItem value="loader">Loader</SelectItem>
                      <SelectItem value="grader">Grader</SelectItem>
                      <SelectItem value="roller">Roller</SelectItem>
                      <SelectItem value="multiple">Multiple Machines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Upload Documents */}
                <div className="space-y-2">
                  <Label htmlFor="documents">Upload Documents *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload License, Certificates, Experience Letters (PDF, JPG, PNG - Max 5MB)
                    </p>
                    <input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 bg-accent/5 p-4 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the Terms & Conditions and Privacy Policy. I confirm that all information provided is accurate and I authorize EquipDriver to verify my credentials.
                  </label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit Registration
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("driver-dashboard")}
                    className="text-accent hover:underline font-semibold"
                  >
                    Login to Dashboard
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-primary">Step 1: Register</h3>
                <p className="text-sm text-muted-foreground">
                  Fill the form and upload documents
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-primary">Step 2: Verification</h3>
                <p className="text-sm text-muted-foreground">
                  We verify your credentials (24-48 hours)
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-primary">Step 3: Start Working</h3>
                <p className="text-sm text-muted-foreground">
                  Get matched with jobs and earn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
