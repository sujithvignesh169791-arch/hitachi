import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Briefcase,
  Clock,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  Calendar,
  Loader2,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { driversApi } from "../services/api";
import { toast } from "sonner";

interface DriverDashboardProps {
  onNavigate: (page: string) => void;
}

export function DriverDashboard({ onNavigate }: DriverDashboardProps) {
  const { user, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        driversApi.getMyProfile(),
        driversApi.getMyStats()
      ]);

      if (profileRes.success) {
        setData(profileRes.data);
        setIsAvailable(profileRes.data.driver.is_available);
      } else {
        toast.error(profileRes.message || "Failed to load profile");
      }

      if (statsRes.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("An error occurred while loading dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    try {
      const res = await driversApi.updateProfile({ is_available: checked });
      if (res.success) {
        setIsAvailable(checked);
        toast.success(`You are now ${checked ? 'available' : 'busy'}`);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const driverProfile = data?.driver || {
    full_name: user?.fullName || "Driver",
    phone: "N/A",
    email: user?.email || "",
    location: "N/A",
    machine_type: "N/A",
    experience_years: 0,
    rating: 0,
    total_jobs: 0,
    verification_status: 'pending'
  };

  const assignedJobs = data?.assigned_jobs || [];
  const appliedJobs = data?.applied_jobs || [];
  const workHistory = data?.work_history || [];
  const paymentHistory = data?.payments || [];
  const notifications = [
    { id: 1, type: "system", message: `Welcome to EquipDriver, ${driverProfile.full_name}!`, time: "Just now", unread: true }
  ];

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-accent">
                <AvatarImage src={driverProfile.profile_image_url} alt={driverProfile.full_name} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  {driverProfile.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {driverProfile.full_name}!</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-semibold">{driverProfile.rating || "0.0"}</span>
                  <span className="text-primary-foreground/70">• {driverProfile.total_jobs || 0} jobs completed</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span>Profile</span>
                  <Badge variant="default" className={driverProfile.verification_status === 'verified' ? "bg-green-600" : "bg-orange-500"}>
                    {driverProfile.verification_status === 'verified' ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {driverProfile.verification_status?.toUpperCase() || "PENDING"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-semibold">{driverProfile.full_name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-semibold">{driverProfile.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-semibold">{driverProfile.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-semibold">{driverProfile.city || driverProfile.location}, {driverProfile.state}</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Specialization</div>
                  <div className="font-semibold text-primary mb-1">{driverProfile.machine_type}</div>
                  <div className="text-sm text-muted-foreground">{driverProfile.experience_years} Years Experience</div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Availability Toggle */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg text-primary mb-1">Availability Status</div>
                    <div className="text-sm text-muted-foreground">
                      {isAvailable ? "You are visible to companies" : "You are not accepting jobs"}
                    </div>
                  </div>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={handleToggleAvailability}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className={`mt-4 p-3 rounded-lg ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">
                      {isAvailable ? "Available for Work" : "Busy"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-accent" />
                    <span className="text-sm">Total Jobs</span>
                  </div>
                  <span className="font-bold text-lg text-primary">{stats?.completed_jobs || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-bold text-lg text-primary">{driverProfile.rating || "0.0"}/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-sm">Active Jobs</span>
                  </div>
                  <span className="font-bold text-lg text-primary">{stats?.active_jobs || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Total Earnings</span>
                  </div>
                  <span className="font-bold text-lg text-primary">₹{(stats?.total_earnings || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Jobs & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assigned Jobs */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span>Assigned Jobs</span>
                  <Badge variant="secondary">{assignedJobs.length} Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {assignedJobs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No active jobs assigned yet.</p>
                      <Button variant="link" onClick={() => onNavigate("browse-jobs")}>Browse available jobs</Button>
                    </div>
                  ) : assignedJobs.map((job: any) => (
                    <div key={job.id} className="border-2 rounded-lg p-4 hover:border-accent transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant={job.status === "active" ? "default" : "secondary"}
                              className={job.status === "active" ? "bg-green-600" : ""}
                            >
                              {job.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-primary mb-2">{job.company_name}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Immediate'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Duration: {job.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold text-accent">{job.budget_display}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Applied Jobs (Posted Jobs Section) */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span>Your Applications</span>
                  <Badge variant="secondary">{appliedJobs.length} Sent</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {appliedJobs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>You haven't applied to any jobs yet.</p>
                    </div>
                  ) : appliedJobs.map((app: any) => (
                    <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant="outline"
                              className={
                                app.status === 'accepted' ? 'text-green-600 border-green-600' :
                                  app.status === 'rejected' ? 'text-red-600 border-red-600' :
                                    'text-blue-600 border-blue-600'
                              }
                            >
                              {app.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Applied on {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-primary">{app.job.company_name}</h3>
                          <p className="text-sm font-medium text-gray-700">{app.job.machine_type}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {app.job.location}
                            </span>
                            <span className="flex items-center gap-1 text-accent font-semibold">
                              <DollarSign className="w-3 h-3" /> {app.job.budget_display}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work History */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle>Work History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {workHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>Work history will appear here once you complete jobs.</p>
                    </div>
                  ) : workHistory.map((work: any) => (
                    <div key={work.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">{work.company_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{work.machine_type}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-muted-foreground">{work.duration}</span>
                            <span className="text-muted-foreground">Completed: {new Date(work.updated_at).toLocaleDateString()}</span>
                            <span className="font-semibold text-accent">{work.budget_display}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold text-primary">Payment ID</th>
                        <th className="pb-3 font-semibold text-primary">Company</th>
                        <th className="pb-3 font-semibold text-primary">Period</th>
                        <th className="pb-3 font-semibold text-primary">Amount</th>
                        <th className="pb-3 font-semibold text-primary">Date</th>
                        <th className="pb-3 font-semibold text-primary">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paymentHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No payment records found.
                          </td>
                        </tr>
                      ) : paymentHistory.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-3 font-mono text-xs truncate max-w-[100px]">{payment.id}</td>
                          <td className="py-3">{payment.company_name}</td>
                          <td className="py-3 text-sm">{payment.for_month}</td>
                          <td className="py-3 font-semibold text-accent">₹{(payment.amount / 100).toLocaleString()}</td>
                          <td className="py-3 text-sm">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Pending'}</td>
                          <td className="py-3">
                            <Badge
                              variant={payment.status === "completed" ? "default" : "secondary"}
                              className={payment.status === "completed" ? "bg-green-600" : ""}
                            >
                              {payment.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {notifications.filter(n => n.unread).length} New
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${notification.unread
                        ? 'bg-accent/5 border-accent/30'
                        : 'bg-gray-50 border-transparent'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Bell className={`w-5 h-5 flex-shrink-0 ${notification.unread ? 'text-accent' : 'text-muted-foreground'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm mb-1">{notification.message}</p>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
