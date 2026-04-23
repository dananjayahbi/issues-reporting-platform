import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{APP_NAME}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{APP_DESCRIPTION}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
