import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, MapPin, Clock, DollarSign, Star, Briefcase, Building2, CheckCircle2, SlidersHorizontal, X, HardHat, Truck, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface BrowseJobsPageProps {
    onNavigate: (page: string) => void;
}

const MACHINE_TYPES = [
    { value: "all", label: "All Machine Types" },
    { value: "excavator", label: "Excavator" },
    { value: "jcb", label: "JCB" },
    { value: "hitachi", label: "Hitachi" },
    { value: "bulldozer", label: "Bulldozer" },
    { value: "crane", label: "Crane" },
    { value: "loader", label: "Loader" },
    { value: "grader", label: "Grader Operator" }
];

const STATES = [
    { value: "all", label: "All States" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Delhi", label: "Delhi" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" }
];

const DURATIONS = [
    { value: "all", label: "Any Duration" },
    { value: "short", label: "Short-term (< 3 months)" },
    { value: "medium", label: "Medium (3-6 months)" },
    { value: "long", label: "Long-term (6+ months)" }
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "highest_pay", label: "Highest Pay" },
    { value: "rating", label: "Top Rated Companies" }
];

export function BrowseJobsPage({ onNavigate }: BrowseJobsPageProps) {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [machineType, setMachineType] = useState("all");
    const [state, setState] = useState("all");
    const [city, setCity] = useState("");
    const [duration, setDuration] = useState("all");
    const [urgentOnly, setUrgentOnly] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<any>({ currentPage: 1, totalPages: 1 });

    useEffect(() => {
        fetchJobs();
    }, [machineType, state, sortBy, pagination.currentPage]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.currentPage,
                limit: 10,
                status: 'active'
            };
            if (machineType !== 'all') params.machine_type = machineType;
            if (state !== 'all') params.state = state;
            if (search) params.search = search;

            const res = await jobsApi.getAll(params);
            if (res.success) {
                setJobs(res.data.jobs);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination({ ...pagination, currentPage: 1 });
        fetchJobs();
    };

    const handleApply = async (jobId: string, jobTitle: string, company: string) => {
        if (!user) {
            toast.error("Please login to apply for jobs");
            onNavigate("login");
            return;
        }
        if (user.role !== 'driver') {
            toast.error("Only drivers can apply for jobs");
            return;
        }

        try {
            const res = await jobsApi.apply(jobId);
            if (res.success) {
                setAppliedJobs(prev => [...prev, jobId]);
                toast.success(`Applied for ${jobTitle} at ${company}!`);
            } else {
                toast.error(res.message || "Failed to apply");
            }
        } catch (error) {
            toast.error("An error occurred during application");
        }
    };

    const clearFilters = () => {
        setSearch("");
        setMachineType("all");
        setState("all");
        setDuration("all");
        setUrgentOnly(false);
    };

    const hasActiveFilters = search || machineType !== "all" || state !== "all" || duration !== "all" || urgentOnly;

    return (
        <div className="flex-1 bg-gray-50">
            {/* Hero Banner */}
            <section className="bg-primary text-white py-10 md:py-14">
                <div className="container mx-auto px-4 text-center">
                    <Briefcase className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Browse Available Jobs</h1>
                    <p className="text-lg text-white/80 mb-6 max-w-xl mx-auto">
                        Find heavy equipment operator jobs across India. All postings verified by EquipDriver.
                    </p>
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by job title, company, or location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 h-14 text-base border-0 shadow-xl text-foreground"
                        />
                        <Button type="submit" className="absolute right-2 top-2 h-10 px-6">Search</Button>
                    </form>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <Card className="border-2 sticky top-24">
                            <CardContent className="p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-primary flex items-center gap-2">
                                        <Filter className="w-4 h-4" /> Filters
                                    </h3>
                                    {hasActiveFilters && (
                                        <button onClick={() => {
                                            setSearch(""); setMachineType("all"); setState("all");
                                        }} className="text-xs text-accent hover:underline flex items-center gap-1">
                                            <X className="w-3 h-3" /> Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-muted-foreground">Machine Type</label>
                                    <Select value={machineType} onValueChange={setMachineType}>
                                        <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {MACHINE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-muted-foreground">State</label>
                                    <Select value={state} onValueChange={setState}>
                                        <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-muted-foreground">Duration</label>
                                    <Select value={duration} onValueChange={setDuration}>
                                        <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {DURATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-muted-foreground">Sort By</label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                                    <input
                                        id="urgent"
                                        type="checkbox"
                                        checked={urgentOnly}
                                        onChange={e => setUrgentOnly(e.target.checked)}
                                        className="w-4 h-4 accent-orange-600"
                                    />
                                    <label htmlFor="urgent" className="text-sm font-medium cursor-pointer">
                                        🚨 Urgent hiring only
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Job List */}
                    <div className="flex-1 space-y-4">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-primary">
                                    {isLoading ? "Searching..." : `${jobs.length} Jobs Found`}
                                </h2>
                                {hasActiveFilters && !isLoading && (
                                    <p className="text-sm text-muted-foreground">Filters applied</p>
                                )}
                            </div>
                            {/* Mobile Filter Toggle */}
                            <button
                                className="lg:hidden flex items-center gap-2 bg-white border-2 border-border rounded-lg px-4 py-2 text-sm font-medium"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters {hasActiveFilters && <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">!</span>}
                            </button>
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <Card className="border-2 lg:hidden">
                                <CardContent className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select value={machineType} onValueChange={setMachineType}>
                                            <SelectTrigger className="border-2"><SelectValue placeholder="Machine Type" /></SelectTrigger>
                                            <SelectContent>{MACHINE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={state} onValueChange={setState}>
                                            <SelectTrigger className="border-2"><SelectValue placeholder="State" /></SelectTrigger>
                                            <SelectContent>{STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={duration} onValueChange={setDuration}>
                                            <SelectTrigger className="border-2"><SelectValue placeholder="Duration" /></SelectTrigger>
                                            <SelectContent>{DURATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="border-2"><SelectValue placeholder="Sort by" /></SelectTrigger>
                                            <SelectContent>{SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={urgentOnly} onChange={e => setUrgentOnly(e.target.checked)} id="urgent-mob" className="w-4 h-4 accent-orange-600" />
                                        <label htmlFor="urgent-mob" className="text-sm cursor-pointer">Urgent hiring only</label>
                                    </div>
                                    {hasActiveFilters && <button onClick={clearFilters} className="text-accent text-sm flex items-center gap-1"><X className="w-3 h-3" />Clear filters</button>}
                                </CardContent>
                            </Card>
                        )}

                        {/* Job Cards */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Finding the best jobs for you...</p>
                            </div>
                        ) : jobs.map((job: any) => {
                            const applied = appliedJobs.includes(job.id);
                            return (
                                <Card key={job.id} className="border-2 hover:shadow-lg transition-all">
                                    <CardContent className="p-5 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            {/* Company Logo */}
                                            <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                                                {job.company_logo ? (
                                                    <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 object-contain" />
                                                ) : (
                                                    <Building2 className="w-7 h-7 text-primary" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                {/* Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className="border-green-600 text-green-700 text-xs">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">{job.machine_type.toUpperCase()}</Badge>
                                                    <span className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</span>
                                                </div>

                                                {/* Title & Company */}
                                                <div>
                                                    <h3 className="text-xl font-bold text-primary">{job.machine_type} Operator</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{job.company_name}</span>
                                                        <span>•</span>
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span>{job.company_rating || "0.0"}</span>
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4 text-accent" />{job.city}, {job.state}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-accent" />{job.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 font-bold text-accent text-base">
                                                        <DollarSign className="w-4 h-4" />{job.budget_display}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                                                {/* Perks */}
                                                <div className="flex flex-wrap gap-2">
                                                    {job.accommodation_provided && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🏠 Accommodation</span>}
                                                    {job.food_provided && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">🍱 Food</span>}
                                                    {job.transport_provided && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">🚌 Transport</span>}
                                                </div>
                                            </div>

                                            {/* Apply Button */}
                                            <div className="flex flex-row md:flex-col items-center gap-2 md:items-end flex-shrink-0">
                                                <Button
                                                    size="lg"
                                                    className={applied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-accent hover:bg-accent/90 text-white"}
                                                    onClick={() => handleApply(job.id, job.machine_type + " Operator", job.company_name)}
                                                    disabled={applied}
                                                >
                                                    {applied ? (
                                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Applied</>
                                                    ) : (
                                                        <><HardHat className="w-4 h-4 mr-2" /> Apply Now</>
                                                    )}
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-xs">Details</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {!isLoading && jobs.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                                <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-xl font-bold text-muted-foreground mb-2">No jobs found</h3>
                                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms.</p>
                                <Button variant="outline" onClick={() => { setSearch(""); setMachineType("all"); setState("all"); }}>Clear all filters</Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">Page {pagination.currentPage} of {pagination.totalPages}</span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
