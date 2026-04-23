"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES, ROLE_LABELS } from "@/lib/utils/constants";
import type { UserRole } from "@/lib/utils/constants";
import { Loader2, Mail, UserPlus } from "lucide-react";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (email: string) => void;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES.VIEWER);
  const [error, setError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: UserRole }) => {
      const response = await fetch("/api/v1/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to invite user");
      }
      return response.json();
    },
    onSuccess: () => {
      setEmail("");
      setRole(USER_ROLES.VIEWER);
      setError("");
      onOpenChange(false);
      onSuccess?.(email);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
    inviteMutation.mutate({ email, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={inviteMutation.isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={USER_ROLES.VIEWER}>{ROLE_LABELS[USER_ROLES.VIEWER]}</SelectItem>
                <SelectItem value={USER_ROLES.ADMIN}>{ROLE_LABELS[USER_ROLES.ADMIN]}</SelectItem>
                <SelectItem value={USER_ROLES.SUPER_ADMIN}>{ROLE_LABELS[USER_ROLES.SUPER_ADMIN]}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {role === USER_ROLES.VIEWER && "Can view issues and participate"}
              {role === USER_ROLES.ADMIN && "Can create, edit, and resolve issues"}
              {role === USER_ROLES.SUPER_ADMIN && "Full admin access including user management"}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={inviteMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Mail className="mr-2 h-4 w-4" />Send Invite</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
