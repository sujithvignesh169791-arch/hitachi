import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
    Eye, EyeOff, LogIn, HardHat, Building2, Shield,
    Phone, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

interface LoginPageProps {
    onNavigate: (page: string) => void;
}

type Role = "driver" | "company" | "admin";

export function LoginPage({ onNavigate }: LoginPageProps) {
    const { login } = useAuth();

    const [role, setRole] = useState<Role>("driver");
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        companyName: "",
        location: "",
        state: "",
        city: "",
        licenseNumber: "",
        machineType: "",
        experienceYears: "",
        gstNumber: "",
    });

    const handleChange = (field: string, value: string) => {
        setError(null);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ─── LOGIN HANDLER ─────────────────────────────────────────
    const handleLogin = async () => {
        const res = await login(formData.email, formData.password);
        if (res.success) {
            toast.success("Welcome back! Redirecting to your dashboard...");
            // Navigation is inferred from the role returned by the API
            // We read the stored user to figure out which dashboard to show
            const stored = localStorage.getItem("ed_user");
            if (stored) {
                const user = JSON.parse(stored);
                setTimeout(() => {
                    if (user.role === "driver") onNavigate("driver-dashboard");
                    else if (user.role === "company") onNavigate("company-dashboard");
                    else onNavigate("admin-dashboard");
                }, 800);
            }
        } else {
            setError(res.message || "Invalid email or password. Please try again.");
            toast.error(res.message || "Login failed. Please check your credentials.");
        }
    };

    // ─── REGISTER HANDLER ──────────────────────────────────────
    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        let res;
        if (role === "driver") {
            res = await authApi.registerDriver({
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                phone: formData.phone,
                location: formData.location || formData.city || "India",
                state: formData.state || "India",
                city: formData.city || "India",
                license_number: formData.licenseNumber || "PENDING",
                machine_type: formData.machineType || "Excavator",
                experience_years: parseInt(formData.experienceYears) || 1,
            });
        } else if (role === "company") {
            res = await authApi.registerCompany({
                email: formData.email,
                password: formData.password,
                company_name: formData.companyName || formData.fullName,
                contact_person: formData.fullName,
                phone: formData.phone,
                location: formData.location || formData.city || "India",
                state: formData.state || "India",
                city: formData.city || "India",
                gst_number: formData.gstNumber,
            });
        } else {
            setError("Admin accounts cannot be created from this form.");
            return;
        }

        if (res?.success) {
            toast.success("Account created! Please sign in.");
            setIsRegister(false);
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
            setError(res?.message || "Registration failed. Please try again.");
            toast.error(res?.message || "Registration failed.");
        }
    };

    // ─── SUBMIT ────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (isRegister) {
            await handleRegister();
        } else {
            await handleLogin();
        }

        setIsLoading(false);
    };

    // ─── QUICK FILL HELPERS ────────────────────────────────────
    const quickFill = (r: Role) => {
        setRole(r);
        setIsRegister(false);
        setError(null);
        if (r === "driver") {
            setFormData(prev => ({ ...prev, email: "rajesh.kumar@driver.com", password: "Driver@123" }));
        } else if (r === "company") {
            setFormData(prev => ({ ...prev, email: "contact@buildtech.com", password: "Company@123" }));
        } else {
            setFormData(prev => ({ ...prev, email: "admin@equipdriver.in", password: "Admin@123456" }));
        }
    };

    const roleConfig = {
        driver: {
            icon: <HardHat className="w-5 h-5" />,
            label: "Driver",
            color: "bg-blue-600",
            desc: "For heavy equipment operators",
            dashboardPage: "driver-dashboard"
        },
        company: {
            icon: <Building2 className="w-5 h-5" />,
            label: "Company",
            color: "bg-orange-600",
            desc: "For construction companies",
            dashboardPage: "company-dashboard"
        },
        admin: {
            icon: <Shield className="w-5 h-5" />,
            label: "Admin",
            color: "bg-purple-600",
            desc: "Platform administrators",
            dashboardPage: "admin-dashboard"
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate("home")}
                    className="flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <Card className="border-2 shadow-2xl overflow-hidden">
                    {/* Color strip */}
                    <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

                    <CardHeader className="text-center pb-2 pt-8">
                        {/* Logo */}
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="bg-accent p-2 rounded-lg">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H7l5-5 5 5h-3v4z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-primary">EquipDriver</span>
                        </div>

                        <CardTitle className="text-2xl text-primary">
                            {isRegister ? "Create Account" : "Welcome Back"}
                        </CardTitle>
                        <CardDescription>
                            {isRegister
                                ? "Join India's largest heavy equipment job marketplace"
                                : "Sign in to access your dashboard"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">
                        {/* Role Selector */}
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-2 block">
                                I am a...
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(roleConfig) as Role[]).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => { setRole(r); setError(null); }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${role === r
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border hover:border-accent/40 text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {roleConfig[r].icon}
                                        <span>{roleConfig[r].label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 text-center">
                                {roleConfig[role].desc}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name / Company Name (Register only) */}
                            {isRegister && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName">
                                        {role === "company" ? "Contact Person Name *" : "Full Name *"}
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            placeholder={role === "company" ? "Your name (contact person)" : "Your full name"}
                                            value={formData.fullName}
                                            onChange={e => handleChange("fullName", e.target.value)}
                                            required
                                            className="pl-10 border-2 focus:border-accent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Company Name (Register + company only) */}
                            {isRegister && role === "company" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="companyName">Company Name *</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="companyName"
                                            placeholder="Your company name"
                                            value={formData.companyName}
                                            onChange={e => handleChange("companyName", e.target.value)}
                                            required
                                            className="pl-10 border-2 focus:border-accent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email Address *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => handleChange("email", e.target.value)}
                                        required
                                        className="pl-10 border-2 focus:border-accent"
                                    />
                                </div>
                            </div>

                            {/* Phone (Register only) */}
                            {isRegister && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={e => handleChange("phone", e.target.value)}
                                            required
                                            className="pl-10 border-2 focus:border-accent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={e => handleChange("password", e.target.value)}
                                        required
                                        className="pl-10 pr-10 border-2 focus:border-accent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password (Register) */}
                            {isRegister && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter password"
                                            value={formData.confirmPassword}
                                            onChange={e => handleChange("confirmPassword", e.target.value)}
                                            required
                                            className="pl-10 border-2 focus:border-accent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Forgot Password */}
                            {!isRegister && role !== "admin" && (
                                <div className="text-right">
                                    <button type="button" className="text-sm text-accent hover:underline">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading}
                                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {isRegister ? "Creating account..." : "Signing in..."}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isRegister ? <CheckCircle2 className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                        {isRegister ? "Create Account" : "Sign In"}
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Toggle Login / Register */}
                        <div className="text-center text-sm text-muted-foreground border-t pt-4">
                            {isRegister ? (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => { setIsRegister(false); setError(null); }}
                                        className="text-accent font-semibold hover:underline"
                                    >
                                        Sign In
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{" "}
                                    <button
                                        onClick={() => {
                                            if (role === "admin") {
                                                toast.info("Admin accounts are created internally. Please contact your administrator.");
                                                return;
                                            }
                                            setIsRegister(true);
                                            setError(null);
                                        }}
                                        className="text-accent font-semibold hover:underline"
                                    >
                                        {role === "driver" ? "Register as Driver" : role === "company" ? "Register Company" : "Contact Admin"}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                SSL Secured
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                Data Protected
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                24/7 Support
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo shortcuts — now auto-fills credentials */}
                <div className="mt-4 p-4 bg-white/60 backdrop-blur border rounded-xl shadow-sm">
                    <p className="text-xs text-center text-muted-foreground mb-2 font-medium">
                        🚀 Quick Demo Login (auto-fills credentials)
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <Badge
                            className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            onClick={() => quickFill("driver")}
                        >
                            Driver Demo
                        </Badge>
                        <Badge
                            className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                            onClick={() => quickFill("company")}
                        >
                            Company Demo
                        </Badge>
                        <Badge
                            className="cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                            onClick={() => quickFill("admin")}
                        >
                            Admin Demo
                        </Badge>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2 opacity-70">
                        Click a badge then hit Sign In
                    </p>
                </div>
            </div>
        </div>
    );
}
