"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useProfile, useUpdateProfile } from "@/hooks/useUsers";
import { UserAvatar } from "@/components/users/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

export function ProfileContainer() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateProfile({
        name: formData.get("name") as string,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <UserAvatar user={profile || session?.user} size="xl" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {profile?.name || session?.user?.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {profile?.email || session?.user?.email}
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Change Avatar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile?.name || session?.user?.name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={profile?.email || session?.user?.email || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile?.role || "User"}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Email Notifications</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Issue Assignments</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive emails when issues are assigned to you
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Comments</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive emails when someone comments on your issues
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Mentions</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive emails when someone mentions you
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Poll Results</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive emails when poll results are available
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Change Password</h3>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button type="submit">Update Password</Button>
            </form>

            <Separator />

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Active Sessions
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are currently logged in on this device.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
