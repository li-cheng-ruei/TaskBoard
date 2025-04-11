
import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  allUsers: User[];
  updateUserRole: (userId: string, role: "manager" | "employee") => void;
  updateUserStatus: (userId: string, isActive: boolean) => void;
  deleteUser: (userId: string) => void;
  createUser: (userData: { name: string; email: string; password: string; facility?: string; role: "manager" | "employee", isActive: boolean }) => void;
  changePassword: (userId: string, newPassword: string) => boolean;
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
    facility: "Central Hospital",
    isActive: true
  },
  {
    id: "2",
    name: "Employee One",
    email: "employee1@example.com",
    role: "employee",
    facility: "Central Hospital",
    isActive: true
  },
  {
    id: "3",
    name: "Employee Two",
    email: "employee2@example.com",
    role: "employee",
    facility: "East Health Center",
    isActive: true
  },
  {
    id: "4",
    name: "李承叡",
    email: "jiannher70@gmail.com",
    role: "manager",
    facility: "博愛醫院",
    isActive: true
  },
  {
    id: "5",
    name: "黃宥婕",
    email: "karta3159237@gmail.com",
    role: "employee",
    facility: "博愛醫院",
    isActive: true
  },  
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(demoUsers);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check if users have been saved to localStorage
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem("users", JSON.stringify(demoUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, we'd make an API call here
      // For demo purposes, we'll use our demo users
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      // Check if user is active
      if (!foundUser.isActive) {
        throw new Error("Your account has been deactivated");
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

  const updateUserRole = (userId: string, role: "manager" | "employee") => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Update current user if their role was changed
    if (user && user.id === userId) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  
  const updateUserStatus = (userId: string, isActive: boolean) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, isActive };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Update current user if their status was changed
    if (user && user.id === userId) {
      const updatedUser = { ...user, isActive };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // If the user deactivated themselves, log them out
      if (!isActive) {
        logout();
      }
    }
  };
  
  const deleteUser = (userId: string) => {
    // Don't allow deleting the last manager
    const managers = users.filter(u => u.role === "manager");
    if (managers.length === 1 && managers[0].id === userId) {
      toast({
        title: "無法刪除用戶",
        description: "您不能刪除最後一個管理員帳戶。",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // If the user deleted themselves, log them out
    if (user && user.id === userId) {
      logout();
    }
  };

  // Add createUser function
  const createUser = (userData: { name: string; email: string; password: string; facility?: string; role: "manager" | "employee"; isActive: boolean }) => {
    // Check if email is already used
    if (users.some(user => user.email === userData.email)) {
      toast({
        title: "創建失敗",
        description: "此電子郵件已被使用。",
        variant: "destructive",
      });
      throw new Error("Email already used");
    }

    // Create a new user with a unique ID
    const newUser: User = {
      id: Date.now().toString(), // Simple ID generation
      name: userData.name,
      email: userData.email,
      role: userData.role,
      facility: userData.facility,
      isActive: userData.isActive
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    return newUser;
  };
  
  // Add password change function
  const changePassword = (userId: string, newPassword: string): boolean => {
    // Validate password (6 characters, alphanumeric)
    if (!/^[a-zA-Z0-9]{6,}$/.test(newPassword)) {
      toast({
        title: "密碼變更失敗",
        description: "密碼必須至少包含6個英文字母或數字。",
        variant: "destructive",
      });
      return false;
    }
    
    // In a real app, we'd update the password in the database
    // For our demo, we'll just display a success toast
    toast({
      title: "密碼已更新",
      description: "您的密碼已成功更改。",
    });
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      allUsers: users,
      updateUserRole,
      updateUserStatus,
      deleteUser,
      createUser,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
