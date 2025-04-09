
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "登入失敗",
        description: "無效的電子郵件或密碼。請重試。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CalendarClock className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">排班管理系統</h1>
          <p className="text-muted-foreground mt-2">請登入以管理您的任務</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>登入</CardTitle>
            <CardDescription>輸入您的憑證以存取您的帳戶</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">登入</Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium">示範帳號:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="text-sm p-2 bg-secondary rounded">
              <p><strong>管理者:</strong> manager@example.com</p>
              <p><strong>密碼:</strong> 任何密碼</p>
            </div>
            <div className="text-sm p-2 bg-secondary rounded">
              <p><strong>員工:</strong> employee1@example.com</p>
              <p><strong>密碼:</strong> 任何密碼</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
