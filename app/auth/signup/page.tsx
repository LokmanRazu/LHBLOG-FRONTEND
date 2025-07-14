"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await signUpUser({
      name,
      email,
      password,
      role: "user", // Default role for signup
    });

    if (data) {
      router.push("/auth/signin");
    } else {
      setError(error || "Sign up failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="py-32">
      <div className="container flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8">
          <h2 className="mb-6 text-center text-2xl font-bold">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
