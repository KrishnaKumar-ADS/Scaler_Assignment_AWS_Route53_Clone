"use client";

import { useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await api.post("/auth/register", { email, password });
      await login(res.data.session_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md z-10 border-border bg-card backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-500/10 rounded-2xl ring-1 ring-blue-500/20">
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create your Account</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Sign up to start managing hosted zones and DNS records
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
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
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
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  className="pl-9 bg-background/50 border-border focus-visible:ring-blue-500 text-zinc-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  className="pl-9 bg-background/50 border-border focus-visible:ring-blue-500 text-zinc-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-foreground font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
