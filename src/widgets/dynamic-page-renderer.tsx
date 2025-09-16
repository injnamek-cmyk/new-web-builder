"use client";

import { Element, Page } from "@/shared/types";
import { HybridRenderer } from "@/features/server-driven-ui/hybrid-renderer";

interface DynamicPageRendererProps {
  page: Page;
}

export function DynamicPageRenderer({ page }: DynamicPageRendererProps) {
  if (!page.content || page.content.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
          <p className="text-gray-600">이 페이지는 아직 콘텐츠가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative">
        {page.content.map((element) => (
          <HybridRenderer
            key={element.id}
            element={element}
            isPreview={true}
          />
        ))}
      </div>
    </div>
  );
}