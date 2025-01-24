import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  onAuthSuccess,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 

    const endpoint = isSignUp
      ? "http://localhost:1337/api/auth/local/register"
      : "http://localhost:1337/api/auth/local";

    const payload = isSignUp
      ? {
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }
      : { identifier: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Something went wrong");
      }

      const data = await response.json();
      console.log("Success:", data);

      if (onAuthSuccess) {
        onAuthSuccess(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isSignUp ? "Sign Up" : "Login"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details below to create a new account"
              : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {isSignUp && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <a
                href="#"
                className="underline underline-offset-4"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                }}
              >
                {isSignUp ? "Log in" : "Sign up"}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
