"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserListItem, UserListResponse } from "@/types/user.types";
import { UserAvatar } from "./UserAvatar";
import { UserPresenceDot } from "./UserPresenceDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, MoreHorizontal, Mail, Edit, UserMinus, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ROLE_LABELS, USER_ROLES } from "@/lib/utils/constants";
import type { UserRole } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

interface AdminUserTableProps {
  onInviteUser?: () => void;
  onEditUser?: (user: UserListItem) => void;
  onDeactivateUser?: (user: UserListItem) => void;
  onSendMessage?: (user: UserListItem) => void;
}

export function AdminUserTable({ onInviteUser, onEditUser, onDeactivateUser, onSendMessage }: AdminUserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", search, roleFilter, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("isActive", statusFilter === "active" ? "true" : "false");
      params.set("page", String(page));
      params.set("pageSize", "20");
      const response = await fetch(`/api/v1/users?${params}`);
      return response.json() as Promise<UserListResponse>;
    },
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value={USER_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
              <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
              <SelectItem value={USER_ROLES.VIEWER}>Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button onClick={onInviteUser}><UserPlus className="mr-2 h-4 w-4" />Invite User</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No users found</TableCell></TableRow>
            ) : (
              users.map((user) => {
                const isOnline = user.isActive;
                return (
                  <TableRow key={user.id}>
                    <TableCell><UserPresenceDot isOnline={isOnline} size="sm" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ id: user.id, displayName: user.name, avatarUrl: user.avatar ?? null, role: user.role }} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={user.role === USER_ROLES.SUPER_ADMIN ? "default" : user.role === USER_ROLES.ADMIN ? "secondary" : "outline"}>{ROLE_LABELS[user.role as UserRole]}</Badge></TableCell>
                    <TableCell className="text-slate-500">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-slate-500">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSendMessage?.(user)}><Mail className="mr-2 h-4 w-4" />Send Message</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditUser?.(user)}><Edit className="mr-2 h-4 w-4" />Edit User</DropdownMenuItem>
                          {user.isActive && <DropdownMenuItem onClick={() => onDeactivateUser?.(user)} className="text-red-600 dark:text-red-400"><UserMinus className="mr-2 h-4 w-4" />Deactivate</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
