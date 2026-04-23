"use client";

import { useState } from "react";
import { Button as _Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export function WelcomeChecklist() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const tasks = [
    { id: "profile", label: "Complete your profile", icon: User },
    { id: "notifications", label: "Set up notification preferences", icon: Bell },
    { id: "password", label: "Change your password", icon: Shield },
    { id: "first-issue", label: "Create your first issue", icon: FileText },
  ];

  const toggleTask = (id: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);
  };

  const allCompleted = completed.size === tasks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">🎉</span>
          Welcome to LLC-Lanka Issue Tracker!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Get started by completing these tasks:
        </p>
        <div className="space-y-3">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
              >
                <Checkbox
                  id={task.id}
                  checked={completed.has(task.id)}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <Icon className="h-5 w-5 text-slate-500" />
                <label
                  htmlFor={task.id}
                  className={`flex-1 cursor-pointer ${
                    completed.has(task.id)
                      ? "text-slate-500 line-through"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {task.label}
                </label>
              </div>
            );
          })}
        </div>
        {allCompleted && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-200 text-center">
            You&apos;re all set! Let&apos;s start tracking issues.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
