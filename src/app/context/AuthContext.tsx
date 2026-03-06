import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setAccessToken, clearAuth } from "../services/api";

export interface User {
    userId: string;
    email: string;
    role: "admin" | "driver" | "company";
    fullName?: string;
    isVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, try to restore session
    useEffect(() => {
        const stored = localStorage.getItem("ed_user");
        const token = localStorage.getItem("ed_token");
        if (stored && token) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                clearAuth();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        if (res.success && res.data) {
            const { accessToken, refreshToken, user: userData } = res.data;
            setAccessToken(accessToken);
            if (refreshToken) localStorage.setItem("ed_refresh", refreshToken);

            const u: User = {
                userId: userData.id,
                email: userData.email,
                role: userData.role,
                fullName: userData.full_name || userData.company_name,
                isVerified: userData.is_verified,
            };
            setUser(u);
            localStorage.setItem("ed_user", JSON.stringify(u));
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        authApi.logout().catch(() => { });
        clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
