"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "LEAD_RECRUITER" | "HIRING_MANAGER" | "VP_TALENT";
  roleTitle: string;
  avatar: string;
  department: string;
  company: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: "user-recruiter-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@hunar.ai",
    role: "LEAD_RECRUITER",
    roleTitle: "Lead Technical Recruiter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Talent Acquisition",
    company: "Hunar.AI",
  },
  {
    id: "user-manager-2",
    name: "Priya Venkatesh",
    email: "priya.v@hunar.ai",
    role: "HIRING_MANAGER",
    roleTitle: "Engineering Hiring Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Core Engineering",
    company: "Hunar.AI",
  },
  {
    id: "user-vp-3",
    name: "Vikram Malhotra",
    email: "vikram.m@hunar.ai",
    role: "VP_TALENT",
    roleTitle: "VP of Talent Operations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Executive Leadership",
    company: "Hunar.AI",
  },
];

interface AuthContextType {
  user: UserProfile | null;
  login: (userOrRole: UserProfile | string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  switchUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hunar_active_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Lead Recruiter on initial load
        setUser(DEMO_USERS[0]);
        localStorage.setItem("hunar_active_user", JSON.stringify(DEMO_USERS[0]));
      }
    } catch {
      setUser(DEMO_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userOrRole: UserProfile | string) => {
    let targetUser: UserProfile;
    if (typeof userOrRole === "string") {
      targetUser = DEMO_USERS.find((u) => u.id === userOrRole || u.role === userOrRole) || DEMO_USERS[0];
    } else {
      targetUser = userOrRole;
    }
    setUser(targetUser);
    try {
      localStorage.setItem("hunar_active_user", JSON.stringify(targetUser));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("hunar_active_user");
    } catch {}
  };

  const switchUser = (userId: string) => {
    const target = DEMO_USERS.find((u) => u.id === userId);
    if (target) {
      setUser(target);
      try {
        localStorage.setItem("hunar_active_user", JSON.stringify(target));
      } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
