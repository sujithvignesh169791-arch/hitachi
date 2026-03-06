import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { DriverRegistrationPage } from "./components/DriverRegistrationPage";
import { CompanyJobPostingPage } from "./components/CompanyJobPostingPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { DriverDashboard } from "./components/DriverDashboard";
import { LoginPage } from "./components/LoginPage";
import { CompanyDashboard } from "./components/CompanyDashboard";
import { BrowseJobsPage } from "./components/BrowseJobsPage";
import { AuthProvider } from "./context/AuthContext";

type Page =
  | "home"
  | "login"
  | "browse-jobs"
  | "driver-registration"
  | "driver-dashboard"
  | "company-job-posting"
  | "company-dashboard"
  | "admin-dashboard";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "browse-jobs":
        return <BrowseJobsPage onNavigate={handleNavigate} />;
      case "driver-registration":
        return <DriverRegistrationPage onNavigate={handleNavigate} />;
      case "driver-dashboard":
        return <DriverDashboard onNavigate={handleNavigate} />;
      case "company-job-posting":
        return <CompanyJobPostingPage onNavigate={handleNavigate} />;
      case "company-dashboard":
        return <CompanyDashboard onNavigate={handleNavigate} />;
      case "admin-dashboard":
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Full-width dashboards that manage their own layout (no shared header/footer)
  const hiddenHeaderPages: Page[] = ["admin-dashboard", "company-dashboard", "driver-dashboard", "login"];
  const showHeaderFooter = !hiddenHeaderPages.includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {showHeaderFooter && (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      {renderPage()}

      {showHeaderFooter && <Footer />}

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}