"use client";

import { useSession } from "next-auth/react";
import AuthButton from "@/components/auth-button";
import { WebsiteManager } from "@/widgets/website-manager";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 mb-6">
            웹사이트 관리를 위해 로그인해주세요.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <WebsiteManager />
      </main>
    </div>
  );
}
