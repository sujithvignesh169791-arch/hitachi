import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Building2, Briefcase, Users, DollarSign, TrendingUp,
    MapPin, Clock, Star, Bell, Settings, LogOut, Plus,
    Search, Eye, CheckCircle2, XCircle, Phone, Mail,
    Calendar, ChevronRight, LayoutDashboard, FileText,
    CreditCard, UserSearch, Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { toast } from "sonner";

interface CompanyDashboardProps {
    onNavigate: (page: string) => void;
}

type Tab = "overview" | "jobs" | "drivers" | "payments" | "notifications";

export function CompanyDashboard({ onNavigate }: CompanyDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [driverSearch, setDriverSearch] = useState("");

    const company = {
        name: "BuildTech Pvt Ltd",
        contact: "Arjun Mehta",
        email: "arjun@buildtech.in",
        phone: "+91 98765 11111",
        location: "Mumbai, Maharashtra",
        gst: "27AABCB1234M1ZN",
        totalHires: 28,
        activeJobs: 3,
        rating: 4.7,
        memberSince: "Jan 2024"
    };

    const stats = [
        { label: "Active Jobs", value: "3", icon: <Briefcase className="w-5 h-5 text-accent" />, bg: "bg-orange-50", change: "+1 this week" },
        { label: "Hired Drivers", value: "28", icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", change: "Total all time" },
        { label: "Pending Payments", value: "₹65K", icon: <DollarSign className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-50", change: "2 pending" },
        { label: "Avg. Rating", value: "4.7★", icon: <TrendingUp className="w-5 h-5 text-green-600" />, bg: "bg-green-50", change: "As employer" }
    ];

    const myJobs = [
        {
            id: "JOB001", title: "Excavator Operator", location: "Andheri, Mumbai",
            driver: { name: "Rajesh Kumar", rating: 4.8, phone: "+91 98765 43210" },
            startDate: "1 Mar 2026", endDate: "31 May 2026", duration: "3 Months",
            payment: "₹30,000/month", status: "active", postedDate: "20 Feb 2026"
        },
        {
            id: "JOB002", title: "JCB Operator", location: "Thane, Mumbai",
            driver: { name: "Amit Sharma", rating: 4.9, phone: "+91 98765 43211" },
            startDate: "15 Mar 2026", endDate: "14 Sep 2026", duration: "6 Months",
            payment: "₹28,000/month", status: "upcoming", postedDate: "22 Feb 2026"
        },
        {
            id: "JOB003", title: "Crane Operator", location: "Bandra, Mumbai",
            driver: null,
            startDate: "TBD", endDate: "TBD", duration: "2 Months",
            payment: "₹35,000/month", status: "pending", postedDate: "25 Feb 2026"
        },
        {
            id: "JOB-H001", title: "Bulldozer Operator", location: "Pune, Maharashtra",
            driver: { name: "Vikram Singh", rating: 4.7, phone: "+91 98765 43213" },
            startDate: "1 Oct 2025", endDate: "31 Jan 2026", duration: "4 Months",
            payment: "₹32,000/month", status: "completed", postedDate: "20 Sep 2025"
        }
    ];

    const availableDrivers = [
        {
            id: "DR001", name: "Suresh Patel", machineType: "Hitachi Operator",
            experience: "5 Years", location: "Pune, Maharashtra", rating: 4.5,
            totalJobs: 42, verified: true,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
        },
        {
            id: "DR002", name: "Manoj Yadav", machineType: "Crane Operator",
            experience: "6 Years", location: "Navi Mumbai", rating: 4.6,
            totalJobs: 38, verified: true,
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
        },
        {
            id: "DR003", name: "Prakash Nair", machineType: "Excavator Operator",
            experience: "9 Years", location: "Mumbai, Maharashtra", rating: 4.9,
            totalJobs: 87, verified: true,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
        },
        {
            id: "DR004", name: "Deepak Gupta", machineType: "JCB Operator",
            experience: "7 Years", location: "Thane, Maharashtra", rating: 4.7,
            totalJobs: 61, verified: true,
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80"
        },
        {
            id: "DR005", name: "Sanjay Borse", machineType: "Loader Operator",
            experience: "4 Years", location: "Pune, Maharashtra", rating: 4.4,
            totalJobs: 29, verified: false,
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80"
        }
    ];

    const payments = [
        { id: "PAY-C001", driver: "Rajesh Kumar", job: "JOB001", amount: "₹30,000", month: "February 2026", date: "25 Feb 2026", status: "completed" },
        { id: "PAY-C002", driver: "Amit Sharma", job: "JOB002", amount: "₹28,000", month: "February 2026", date: "25 Feb 2026", status: "completed" },
        { id: "PAY-C003", driver: "Rajesh Kumar", job: "JOB001", amount: "₹30,000", month: "March 2026", date: "5 Mar 2026", status: "pending" },
        { id: "PAY-C004", driver: "Vikram Singh", job: "JOB-H001", amount: "₹32,000", month: "January 2026", date: "25 Jan 2026", status: "completed" },
        { id: "PAY-C005", driver: "Amit Sharma", job: "JOB002", amount: "₹28,000", month: "March 2026", date: "10 Mar 2026", status: "pending" }
    ];

    const notifications = [
        { id: 1, type: "match", message: "New driver match found for JOB003: Manoj Yadav (4.6★)", time: "30 min ago", unread: true },
        { id: 2, type: "payment", message: "Payment of ₹30,000 to Rajesh Kumar confirmed for February", time: "2 hours ago", unread: true },
        { id: 3, type: "job", message: "JOB002 has been approved by admin. Work starts 15 Mar.", time: "1 day ago", unread: false },
        { id: 4, type: "info", message: "Rate your recent hire: Vikram Singh (JOB-H001)", time: "2 days ago", unread: false },
        { id: 5, type: "alert", message: "Document renewal reminder: GST certificate expires in 30 days", time: "3 days ago", unread: false }
    ];

    const filteredDrivers = availableDrivers.filter(d =>
        d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.machineType.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.location.toLowerCase().includes(driverSearch.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            active: "bg-green-600", upcoming: "bg-blue-600",
            pending: "bg-yellow-600", completed: "bg-gray-500"
        };
        return map[status] || "bg-gray-400";
    };

    const SidebarContent = () => (
        <>
            <div className="p-6">
                <div className="flex items-center space-x-2 mb-8">
                    <div className="bg-accent p-2 rounded-lg">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Company</span>
                </div>

                <nav className="space-y-1">
                    {[
                        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
                        { id: "jobs", label: "My Jobs", icon: <FileText className="w-4 h-4" /> },
                        { id: "drivers", label: "Find Drivers", icon: <UserSearch className="w-4 h-4" /> },
                        { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
                        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, badge: notifications.filter(n => n.unread).length }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as Tab); setMobileOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                    : "hover:bg-sidebar-accent/40"
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                {item.icon}
                                {item.label}
                            </span>
                            {item.badge ? (
                                <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}

                    <hr className="border-sidebar-border my-3" />

                    <button
                        onClick={() => onNavigate("company-job-posting")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent font-semibold transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Post New Job
                    </button>
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
                <button
                    onClick={() => { onNavigate("home"); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/40 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
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
                {/* Top Header */}
                <div className="bg-white border-b sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Mobile Menu */}
                                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="icon" className="lg:hidden">
                                            <Menu className="w-4 h-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
                                        <SidebarContent />
                                    </SheetContent>
                                </Sheet>

                                {/* Company Header Info */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent/10 p-2 rounded-lg">
                                        <Building2 className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-primary leading-tight">{company.name}</h1>
                                        <p className="text-xs text-muted-foreground">{company.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex items-center gap-1 border-accent text-accent hover:bg-accent hover:text-white"
                                    onClick={() => onNavigate("company-job-posting")}
                                >
                                    <Plus className="w-4 h-4" />
                                    Post Job
                                </Button>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* ────────── OVERVIEW ────────── */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.map((s, i) => (
                                    <Card key={i} className="border-2 hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                                {s.icon}
                                            </div>
                                            <div className="text-2xl font-bold text-primary">{s.value}</div>
                                            <div className="text-sm text-muted-foreground">{s.label}</div>
                                            <div className="text-xs text-green-600 mt-1">{s.change}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Active Jobs + Company Profile */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Active Jobs */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-primary">Active & Upcoming Jobs</h2>
                                        <button
                                            className="text-accent text-sm hover:underline flex items-center gap-1"
                                            onClick={() => setActiveTab("jobs")}
                                        >
                                            View all <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {myJobs.filter(j => ["active", "upcoming", "pending"].includes(j.status)).map(job => (
                                        <Card key={job.id} className="border-2 hover:border-accent/50 transition-colors">
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={`text-white text-xs ${getStatusBadge(job.status)}`}>
                                                                {job.status}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground font-mono">{job.id}</span>
                                                        </div>
                                                        <h3 className="font-semibold text-primary">{job.title}</h3>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.duration}</span>
                                                        </div>
                                                        {job.driver ? (
                                                            <div className="mt-2 flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                                <div>
                                                                    <span className="text-sm font-medium text-green-800">{job.driver.name}</span>
                                                                    <span className="text-xs text-green-600 ml-2">⭐ {job.driver.rating}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2">
                                                                <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                                                <span className="text-sm text-yellow-700">Awaiting driver assignment</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-accent text-sm">{job.payment}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Company Profile Card */}
                                <div className="space-y-4">
                                    <Card className="border-2">
                                        <CardHeader className="bg-primary/5 pb-3">
                                            <CardTitle className="text-sm">Company Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                                    B
                                                </div>
                                                <div>
                                                    <div className="font-bold text-primary">{company.name}</div>
                                                    <div className="text-xs text-muted-foreground">{company.memberSince}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4" />{company.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="w-4 h-4" />{company.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />{company.location}
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t flex justify-between text-sm">
                                                <div className="text-center">
                                                    <div className="font-bold text-primary">{company.totalHires}</div>
                                                    <div className="text-xs text-muted-foreground">Total Hires</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-primary">{company.rating}★</div>
                                                    <div className="text-xs text-muted-foreground">Rating</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-primary">{company.activeJobs}</div>
                                                    <div className="text-xs text-muted-foreground">Active Jobs</div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="w-full">Edit Profile</Button>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Notifications */}
                                    <Card className="border-2">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex justify-between items-center">
                                                Recent Alerts
                                                <Badge className="bg-accent text-white text-xs">{notifications.filter(n => n.unread).length}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2">
                                            {notifications.filter(n => n.unread).map(n => (
                                                <div key={n.id} className="text-xs p-2 bg-accent/5 rounded-lg border border-accent/20">
                                                    <p className="text-foreground">{n.message}</p>
                                                    <p className="text-muted-foreground mt-1">{n.time}</p>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setActiveTab("notifications")}
                                                className="text-accent text-xs hover:underline w-full text-right"
                                            >
                                                View all →
                                            </button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ────────── MY JOBS ────────── */}
                    {activeTab === "jobs" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-primary">My Job Postings</h2>
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white"
                                    onClick={() => onNavigate("company-job-posting")}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Post New Job
                                </Button>
                            </div>

                            {myJobs.map(job => (
                                <Card key={job.id} className={`border-2 transition-all hover:shadow-md ${job.status === "active" ? "border-green-200" : ""}`}>
                                    <CardContent className="p-5">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge className={`text-white text-xs ${getStatusBadge(job.status)}`}>
                                                        {job.status.toUpperCase()}
                                                    </Badge>
                                                    <span className="font-mono text-xs text-muted-foreground">{job.id}</span>
                                                    <span className="text-xs text-muted-foreground">Posted: {job.postedDate}</span>
                                                </div>
                                                <h3 className="font-bold text-primary text-lg">{job.title}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.duration}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Start: {job.startDate}</span>
                                                    <span className="font-bold text-accent">{job.payment}</span>
                                                </div>

                                                {job.driver ? (
                                                    <div className="mt-2 inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <div>
                                                            <span className="text-sm font-semibold text-green-800">{job.driver.name}</span>
                                                            <span className="text-xs text-green-600 ml-2">{job.driver.phone}</span>
                                                            <span className="text-xs text-yellow-600 ml-2">⭐ {job.driver.rating}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700">
                                                        <Clock className="w-4 h-4" />
                                                        Awaiting admin assignment
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-row md:flex-col gap-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                </Button>
                                                {job.status === "active" && (
                                                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-white"
                                                        onClick={() => toast.success("Extension request sent!")}>
                                                        Extend
                                                    </Button>
                                                )}
                                                {job.status === "pending" && (
                                                    <Button size="sm" variant="destructive"
                                                        onClick={() => toast.info("Job withdrawn.")}>
                                                        <XCircle className="w-4 h-4 mr-1" /> Withdraw
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ────────── FIND DRIVERS ────────── */}
                    {activeTab === "drivers" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-primary">Available Drivers</h2>
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, skill, or location..."
                                        value={driverSearch}
                                        onChange={e => setDriverSearch(e.target.value)}
                                        className="pl-10 border-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredDrivers.map(driver => (
                                    <Card key={driver.id} className="border-2 hover:border-accent hover:shadow-lg transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="w-14 h-14 border-2 border-accent/30">
                                                    <AvatarImage src={driver.image} alt={driver.name} />
                                                    <AvatarFallback className="bg-primary text-white font-bold">
                                                        {driver.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-primary">{driver.name}</h3>
                                                        {driver.verified && (
                                                            <Badge className="bg-green-600 text-white text-xs">✓ Verified</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-accent font-medium">{driver.machineType}</p>
                                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />{driver.location}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span>{driver.experience}</span>
                                                            <span>• {driver.totalJobs} jobs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(driver.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                                    ))}
                                                    <span className="text-xs text-muted-foreground ml-1">{driver.rating}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-xs">Profile</Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-accent hover:bg-accent/90 text-white text-xs"
                                                        onClick={() => toast.success(`Interest sent to ${driver.name}! Admin will coordinate.`)}
                                                    >
                                                        Hire
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredDrivers.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <UserSearch className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                    <p>No drivers found matching "{driverSearch}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ────────── PAYMENTS ────────── */}
                    {activeTab === "payments" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-primary">Payment History</h2>

                            {/* Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: "Total Paid", value: "₹1,58,000", color: "text-green-600", bg: "bg-green-50" },
                                    { label: "Pending", value: "₹58,000", color: "text-yellow-600", bg: "bg-yellow-50" },
                                    { label: "This Month", value: "₹88,000", color: "text-primary", bg: "bg-blue-50" }
                                ].map((s, i) => (
                                    <Card key={i} className={`border-2 ${s.bg}`}>
                                        <CardContent className="p-4 text-center">
                                            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                            <div className="text-sm text-muted-foreground">{s.label}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card className="border-2">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="border-b bg-gray-50">
                                                <tr className="text-left">
                                                    {["Payment ID", "Driver", "Job", "Period", "Amount", "Date", "Status", "Action"].map(h => (
                                                        <th key={h} className="px-4 py-3 text-sm font-semibold text-primary">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {payments.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                                                        <td className="px-4 py-3 font-semibold text-sm">{p.driver}</td>
                                                        <td className="px-4 py-3 font-mono text-xs">{p.job}</td>
                                                        <td className="px-4 py-3 text-sm">{p.month}</td>
                                                        <td className="px-4 py-3 font-bold text-accent">{p.amount}</td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">{p.date}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={p.status === "completed" ? "bg-green-600 text-white" : "bg-yellow-100 text-yellow-800"}>
                                                                {p.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {p.status === "pending" ? (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-accent hover:bg-accent/90 text-white text-xs"
                                                                    onClick={() => toast.success(`Payment initiated for ${p.driver}!`)}
                                                                >
                                                                    Pay Now
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" variant="outline" className="text-xs">
                                                                    Receipt
                                                                </Button>
                                                            )}
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

                    {/* ────────── NOTIFICATIONS ────────── */}
                    {activeTab === "notifications" && (
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-primary">Notifications</h2>
                                <Button variant="outline" size="sm">Mark all as read</Button>
                            </div>

                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors ${n.unread ? "bg-accent/5 border-accent/30" : "bg-white border-border"
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${n.type === "match" ? "bg-green-100 text-green-600" :
                                            n.type === "payment" ? "bg-blue-100 text-blue-600" :
                                                n.type === "alert" ? "bg-red-100 text-red-600" :
                                                    "bg-gray-100 text-gray-600"
                                        }`}>
                                        {n.type === "match" ? <Users className="w-5 h-5" /> :
                                            n.type === "payment" ? <DollarSign className="w-5 h-5" /> :
                                                n.type === "alert" ? <Bell className="w-5 h-5" /> :
                                                    <Briefcase className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{n.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                                    </div>
                                    {n.unread && <div className="w-2.5 h-2.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
