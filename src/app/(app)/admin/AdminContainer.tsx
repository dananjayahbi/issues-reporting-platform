"use client";

import { useState } from "react";
import { useUserStats } from "@/hooks/useUsers";
import { AdminUserTable } from "@/components/users/AdminUserTable";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";

export function AdminContainer() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { data: stats } = useUserStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage users, roles, and system settings
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="users"
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon="check-circle"
        />
        <StatsCard
          title="Admin Users"
          value={stats?.adminUsers || 0}
          icon="shield"
        />
        <StatsCard
          title="Inactive Users"
          value={stats?.inactiveUsers || 0}
          icon="users"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <AdminUserTable />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Role Permissions
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Role and permission management coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              System Settings
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              System settings management coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Audit Log
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Audit log viewer coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <InviteUserDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
    </div>
  );
}
