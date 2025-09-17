"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { WebsiteRenderer } from "@/features/server-driven-ui/website-renderer";
import { WebsiteRenderData } from "@/shared/types/server-driven-ui";
import { Loader2 } from "lucide-react";
import { ModeProvider } from "@/shared/contexts/mode-context";

export default function PreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const websiteId = params?.id as string;
  const currentPagePath = searchParams?.get("page") || "/";

  const [websiteData, setWebsiteData] = useState<WebsiteRenderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!websiteId) return;

    const fetchWebsiteData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/render/website/${websiteId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch website data");
        }

        const result = await response.json();
        setWebsiteData(result);
      } catch (err) {
        console.error("Error fetching website data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [websiteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">웹사이트를 로딩하는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">오류 발생</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            웹사이트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600">요청한 웹사이트가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <ModeProvider mode="preview">
      <WebsiteRenderer
        websiteData={websiteData}
        currentPagePath={currentPagePath}
      />
    </ModeProvider>
  );
}
