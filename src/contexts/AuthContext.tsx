
import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Demo users for development
const demoUsers: User[] = [
  {
    id: "1",
    name: "Manager User",
    email: "manager@example.com",
    role: "manager",
    facility: "Central Hospital"
  },
  {
    id: "2",
    name: "Employee One",
    email: "employee1@example.com",
    role: "employee",
    facility: "Central Hospital"
  },
  {
    id: "3",
    name: "Employee Two",
    email: "employee2@example.com",
    role: "employee",
    facility: "East Health Center"
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, we'd make an API call here
      // For demo purposes, we'll use our demo users
      const foundUser = demoUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      // In a real app, we'd verify the password here
      
      // Save the user to localStorage
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, allUsers: demoUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
