import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Briefcase, CheckCircle2, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface CompanyJobPostingPageProps {
  onNavigate: (page: string) => void;
}

export function CompanyJobPostingPage({ onNavigate }: CompanyJobPostingPageProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    machineType: "",
    duration: "",
    budget: "",
    description: "",
    location: "",
    city: "",
    state: "",
    accommodation: false,
    food: false,
    nightShifts: false,
    transport: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to post a job");
      onNavigate("login");
      return;
    }

    setIsLoading(true);
    try {
      // Parse budget range
      const budgetDisplay = formData.budget === "40+" ? "₹40,000+" : `₹${formData.budget.replace('-', ' - ₹')}K`;
      const [min, max] = formData.budget.includes('-') ? formData.budget.split('-').map((v: string) => parseInt(v) * 1000) : [40000, 100000];

      const res = await jobsApi.create({
        machine_type: formData.machineType,
        location: formData.location,
        state: formData.state || formData.location.split(',')[1]?.trim() || 'Maharashtra',
        city: formData.city || formData.location.split(',')[0]?.trim() || formData.location,
        duration: formData.duration,
        budget_min: min,
        budget_max: max,
        budget_display: budgetDisplay,
        description: formData.description,
        accommodation_provided: formData.accommodation,
        food_provided: formData.food,
        night_shifts: formData.nightShifts,
        transport_provided: formData.transport
      });

      if (res.success) {
        toast.success("Job posted successfully!");
        onNavigate("company-dashboard");
      } else {
        toast.error(res.message || "Failed to post job");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <Briefcase className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Post a Job
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Find skilled and verified heavy equipment operators for your construction projects. Quick matching, transparent pricing.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-accent text-2xl font-bold mb-2">24 Hours</div>
              <div className="text-sm text-muted-foreground">Average Matching Time</div>
            </div>
            <div>
              <div className="text-accent text-2xl font-bold mb-2">5000+</div>
              <div className="text-sm text-muted-foreground">Verified Operators</div>
            </div>
            <div>
              <div className="text-accent text-2xl font-bold mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Posting Form */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl text-primary">Job Posting Form</CardTitle>
              <CardDescription>
                Provide job details and we'll match you with the best operators for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                      className="border-2 focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      required
                      className="border-2 focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Exact Site Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Bandra East Metro Site"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                    className="border-2 focus:border-accent"
                  />
                </div>

                {/* Machine Type Required */}
                <div className="space-y-2">
                  <Label htmlFor="machineType">Machine Type Required *</Label>
                  <Select
                    value={formData.machineType}
                    onValueChange={(value) => handleChange("machineType", value)}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-accent">
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excavator">Excavator Operator</SelectItem>
                      <SelectItem value="jcb">JCB Operator</SelectItem>
                      <SelectItem value="hitachi">Hitachi Operator</SelectItem>
                      <SelectItem value="bulldozer">Bulldozer Operator</SelectItem>
                      <SelectItem value="crane">Crane Operator</SelectItem>
                      <SelectItem value="loader">Loader Operator</SelectItem>
                      <SelectItem value="grader">Grader Operator</SelectItem>
                      <SelectItem value="roller">Roller Operator</SelectItem>
                      <SelectItem value="multiple">Multiple Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration and Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => handleChange("duration", value)}
                      required
                    >
                      <SelectTrigger className="border-2 focus:border-accent">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-7">1-7 Days</SelectItem>
                        <SelectItem value="1-4">1-4 Weeks</SelectItem>
                        <SelectItem value="1-3">1-3 Months</SelectItem>
                        <SelectItem value="3-6">3-6 Months</SelectItem>
                        <SelectItem value="6+">6+ Months</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (per month) *</Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value) => handleChange("budget", value)}
                      required
                    >
                      <SelectTrigger className="border-2 focus:border-accent">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-20">₹15,000 - ₹20,000</SelectItem>
                        <SelectItem value="20-25">₹20,000 - ₹25,000</SelectItem>
                        <SelectItem value="25-30">₹25,000 - ₹30,000</SelectItem>
                        <SelectItem value="30-40">₹30,000 - ₹40,000</SelectItem>
                        <SelectItem value="40+">₹40,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the project, working hours, site conditions, and any specific requirements..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                    rows={5}
                    className="border-2 focus:border-accent"
                  />
                </div>

                <div className="bg-accent/5 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-primary">Additional Requirements (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.accommodation}
                        onChange={e => handleChange("accommodation", e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Accommodation Provided</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.food}
                        onChange={e => handleChange("food", e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Food Provided</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.nightShifts}
                        onChange={e => handleChange("nightShifts", e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Night Shifts Required</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.transport}
                        onChange={e => handleChange("transport", e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Transport Provided</span>
                    </label>
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
                    I agree to the Terms & Conditions and confirm that all information provided is accurate. I understand that EquipDriver will verify company details before matching.
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Posting...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Post Job Now</>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Need help?{" "}
                  <a href="#" className="text-accent hover:underline font-semibold">
                    Contact Support
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Process Steps */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="bg-accent text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-primary">Post Your Job</h3>
                <p className="text-sm text-muted-foreground">
                  Fill the form with your requirements
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="bg-accent text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-primary">Get Matched</h3>
                <p className="text-sm text-muted-foreground">
                  We find the best operators for you
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="bg-accent text-accent-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-primary">Start Working</h3>
                <p className="text-sm text-muted-foreground">
                  Operator joins your project
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
