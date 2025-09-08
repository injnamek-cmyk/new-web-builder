"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DynamicRenderer } from "@/features/server-driven-ui/dynamic-renderer";
import { PageRenderData } from "@/shared/types/server-driven-ui";
import { Loader2 } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const pageId = params.id as string;

  const [renderData, setRenderData] = useState<PageRenderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) return;

    const fetchRenderData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/render/${pageId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch page data");
        }
        
        const result = await response.json();
        setRenderData(result.data);
      } catch (err) {
        console.error("Error fetching render data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRenderData();
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">페이지를 로딩하는 중...</span>
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

  if (!renderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청한 페이지가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {renderData.title}
            </h1>
            <div className="text-sm text-gray-500">
              페이지 ID: {renderData.pageId}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <DynamicRenderer
            elements={renderData.canvas.elements}
            canvasWidth={renderData.canvas.width}
            canvasHeight={renderData.canvas.height}
          />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>생성일: {new Date(renderData.metadata.createdAt).toLocaleString("ko-KR")}</p>
            <p>수정일: {new Date(renderData.metadata.updatedAt).toLocaleString("ko-KR")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}