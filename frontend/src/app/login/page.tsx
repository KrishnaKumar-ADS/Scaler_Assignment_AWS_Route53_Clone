"use client";

import { useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.session_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md z-10 border-border bg-card backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-500/10 rounded-2xl ring-1 ring-blue-500/20">
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Route53 Console</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to manage your hosted zones and DNS records
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 bg-background/50 border-border focus-visible:ring-blue-500 text-zinc-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-9 bg-background/50 border-border focus-visible:ring-blue-500 text-zinc-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-foreground font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sign In
            </Button>
            
            <p className="text-xs text-center text-zinc-500">
              Use <strong className="text-zinc-300">user1@example.com</strong> and <strong className="text-zinc-300">password123</strong> for demo access
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
