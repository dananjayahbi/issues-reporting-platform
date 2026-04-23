"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuccessAlert } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", data);
      setSuccess(true);
    } catch (_err) {
      setError("Failed to send reset email. Please check your email address.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Check Your Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            We have sent a password reset link to your email address. The link will expire in 24 hours.
          </p>
        </div>

        <SuccessAlert>
          <AlertDescription>
            If you don&apos;t receive an email within a few minutes, check your spam folder or contact support.
          </AlertDescription>
        </SuccessAlert>

        <div className="text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-primary hover:underline"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset Password</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter your email address and we will send you a reset link
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@llc-lanka.com"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-primary hover:underline"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
}
