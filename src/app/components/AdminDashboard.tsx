import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  LayoutDashboard,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  Search,
  Filter,
  Eye,
  CheckCheck,
  XCircle,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Menu
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "drivers" | "jobs" | "payments">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data
  const stats = [
    {
      title: "Total Drivers",
      value: "5,247",
      change: "+12%",
      icon: <Users className="w-6 h-6 text-accent" />,
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Jobs",
      value: "843",
      change: "+8%",
      icon: <Briefcase className="w-6 h-6 text-accent" />,
      bgColor: "bg-orange-50"
    },
    {
      title: "Completed Jobs",
      value: "15,642",
      change: "+15%",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      bgColor: "bg-green-50"
    },
    {
      title: "Total Revenue",
      value: "₹2.4Cr",
      change: "+23%",
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-purple-50"
    }
  ];

  const drivers = [
    {
      id: "DR001",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      location: "Mumbai, Maharashtra",
      machineType: "Excavator",
      experience: "8 Years",
      status: "verified",
      rating: 4.8
    },
    {
      id: "DR002",
      name: "Amit Sharma",
      phone: "+91 98765 43211",
      location: "Delhi, NCR",
      machineType: "JCB",
      experience: "12 Years",
      status: "verified",
      rating: 4.9
    },
    {
      id: "DR003",
      name: "Suresh Patel",
      phone: "+91 98765 43212",
      location: "Pune, Maharashtra",
      machineType: "Hitachi",
      experience: "5 Years",
      status: "pending",
      rating: 4.5
    },
    {
      id: "DR004",
      name: "Vikram Singh",
      phone: "+91 98765 43213",
      location: "Bangalore, Karnataka",
      machineType: "Bulldozer",
      experience: "10 Years",
      status: "verified",
      rating: 4.7
    },
    {
      id: "DR005",
      name: "Manoj Yadav",
      phone: "+91 98765 43214",
      location: "Hyderabad, Telangana",
      machineType: "Crane",
      experience: "6 Years",
      status: "pending",
      rating: 4.6
    }
  ];

  const jobs = [
    {
      id: "JOB001",
      company: "BuildTech Pvt Ltd",
      machineType: "Excavator",
      location: "Mumbai",
      duration: "3 Months",
      budget: "₹30,000/month",
      status: "active",
      postedDate: "2 days ago"
    },
    {
      id: "JOB002",
      company: "Metro Construction",
      machineType: "JCB",
      location: "Delhi",
      duration: "6 Months",
      budget: "₹35,000/month",
      status: "pending",
      postedDate: "5 hours ago"
    },
    {
      id: "JOB003",
      company: "Highway Developers",
      machineType: "Hitachi",
      location: "Pune",
      duration: "1 Month",
      budget: "₹28,000/month",
      status: "active",
      postedDate: "1 day ago"
    },
    {
      id: "JOB004",
      company: "Urban Infrastructure",
      machineType: "Bulldozer",
      location: "Bangalore",
      duration: "4 Months",
      budget: "₹40,000/month",
      status: "completed",
      postedDate: "2 weeks ago"
    }
  ];

  const payments = [
    {
      id: "PAY001",
      driver: "Rajesh Kumar",
      company: "BuildTech Pvt Ltd",
      amount: "₹30,000",
      status: "completed",
      date: "25 Feb 2026"
    },
    {
      id: "PAY002",
      driver: "Amit Sharma",
      company: "Metro Construction",
      amount: "₹35,000",
      status: "pending",
      date: "24 Feb 2026"
    },
    {
      id: "PAY003",
      driver: "Vikram Singh",
      company: "Highway Developers",
      amount: "₹28,000",
      status: "completed",
      date: "23 Feb 2026"
    },
    {
      id: "PAY004",
      driver: "Manoj Yadav",
      company: "Urban Infrastructure",
      amount: "₹40,000",
      status: "processing",
      date: "22 Feb 2026"
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="bg-accent p-2 rounded-lg">
            <svg 
              className="w-6 h-6 text-accent-foreground" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H7l5-5 5 5h-3v4z"/>
            </svg>
          </div>
          <span className="text-xl font-bold">Admin</span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => {
              setActiveTab("overview");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "overview"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("drivers");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "drivers"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Drivers</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("jobs");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "jobs"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Job Requests</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("payments");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "payments"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Payments</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
        <button 
          onClick={() => {
            onNavigate("home");
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground hidden lg:block relative">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <div>
                  <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage drivers, jobs, and payments</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="border-2">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-accent hover:bg-accent/90">
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          {stat.icon}
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.title}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Recent Driver Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {drivers.slice(0, 3).map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold text-primary">{driver.name}</div>
                            <div className="text-sm text-muted-foreground">{driver.machineType}</div>
                          </div>
                          <Badge variant={driver.status === "verified" ? "default" : "secondary"}>
                            {driver.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Recent Job Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold text-primary">{job.company}</div>
                            <div className="text-sm text-muted-foreground">{job.machineType} - {job.location}</div>
                          </div>
                          <Badge 
                            variant={
                              job.status === "active" ? "default" : 
                              job.status === "pending" ? "secondary" : 
                              "outline"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Driver Management</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search drivers..." 
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold text-primary">ID</th>
                          <th className="pb-3 font-semibold text-primary">Name</th>
                          <th className="pb-3 font-semibold text-primary">Contact</th>
                          <th className="pb-3 font-semibold text-primary">Machine Type</th>
                          <th className="pb-3 font-semibold text-primary">Experience</th>
                          <th className="pb-3 font-semibold text-primary">Status</th>
                          <th className="pb-3 font-semibold text-primary">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {drivers.map((driver) => (
                          <tr key={driver.id} className="hover:bg-gray-50">
                            <td className="py-4 font-mono text-sm">{driver.id}</td>
                            <td className="py-4">
                              <div className="font-semibold">{driver.name}</div>
                              <div className="text-sm text-muted-foreground">{driver.location}</div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {driver.phone}
                                </div>
                              </div>
                            </td>
                            <td className="py-4">{driver.machineType}</td>
                            <td className="py-4">{driver.experience}</td>
                            <td className="py-4">
                              <Badge 
                                variant={driver.status === "verified" ? "default" : "secondary"}
                                className={driver.status === "verified" ? "bg-green-600" : ""}
                              >
                                {driver.status === "verified" ? (
                                  <CheckCheck className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {driver.status}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {driver.status === "pending" && (
                                  <>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Job Requests</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search jobs..." 
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold text-primary">Job ID</th>
                          <th className="pb-3 font-semibold text-primary">Company</th>
                          <th className="pb-3 font-semibold text-primary">Machine Type</th>
                          <th className="pb-3 font-semibold text-primary">Location</th>
                          <th className="pb-3 font-semibold text-primary">Duration</th>
                          <th className="pb-3 font-semibold text-primary">Budget</th>
                          <th className="pb-3 font-semibold text-primary">Status</th>
                          <th className="pb-3 font-semibold text-primary">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="py-4 font-mono text-sm">{job.id}</td>
                            <td className="py-4">
                              <div className="font-semibold">{job.company}</div>
                              <div className="text-sm text-muted-foreground">{job.postedDate}</div>
                            </td>
                            <td className="py-4">{job.machineType}</td>
                            <td className="py-4">{job.location}</td>
                            <td className="py-4">{job.duration}</td>
                            <td className="py-4 font-semibold text-accent">{job.budget}</td>
                            <td className="py-4">
                              <Badge 
                                variant={
                                  job.status === "active" ? "default" : 
                                  job.status === "pending" ? "secondary" : 
                                  "outline"
                                }
                                className={job.status === "active" ? "bg-green-600" : ""}
                              >
                                {job.status}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="bg-accent hover:bg-accent/90">
                                  Match
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Payment Status</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search payments..." 
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold text-primary">Payment ID</th>
                          <th className="pb-3 font-semibold text-primary">Driver</th>
                          <th className="pb-3 font-semibold text-primary">Company</th>
                          <th className="pb-3 font-semibold text-primary">Amount</th>
                          <th className="pb-3 font-semibold text-primary">Date</th>
                          <th className="pb-3 font-semibold text-primary">Status</th>
                          <th className="pb-3 font-semibold text-primary">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="py-4 font-mono text-sm">{payment.id}</td>
                            <td className="py-4 font-semibold">{payment.driver}</td>
                            <td className="py-4">{payment.company}</td>
                            <td className="py-4 font-semibold text-accent">{payment.amount}</td>
                            <td className="py-4">{payment.date}</td>
                            <td className="py-4">
                              <Badge 
                                variant={
                                  payment.status === "completed" ? "default" : 
                                  payment.status === "pending" ? "secondary" : 
                                  "outline"
                                }
                                className={payment.status === "completed" ? "bg-green-600" : ""}
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {payment.status === "pending" && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}