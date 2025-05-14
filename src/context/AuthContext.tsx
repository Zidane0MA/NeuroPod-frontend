
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mock login function that sets user based on email
  const login = (email: string) => {
    const newUser: User = 
      email === "lolerodiez@gmail.com" 
        ? { 
            id: "admin-1",
            email, 
            name: "Admin", 
            registrationDate: new Date().toLocaleDateString(),
            activePods: 2,
            totalPods: 5,
            balance: Infinity,
            status: 'online',
            role: "admin" 
          } 
        : { 
            id: "client-1",
            email, 
            name: "Cliente", 
            registrationDate: new Date().toLocaleDateString(),
            activePods: 1,
            totalPods: 3,
            balance: 10,
            status: 'online',
            role: "client" 
          };
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
