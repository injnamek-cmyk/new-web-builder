"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import PageActions from "@/features/editor-controls/page-actions";
import AuthButton from "@/components/auth-button";
import { useWebsiteStore } from "@/processes/website-store";
import { useEditorStore } from "@/processes/editor-store";

export default function GlobalHeader() {
  const pathname = usePathname();
  const isEditorPage = pathname?.startsWith("/editor/");
  const isPreviewPage = pathname?.startsWith("/preview/");

  const { currentWebsite } = useWebsiteStore();
  const { canvas, currentPageTitle } = useEditorStore();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!isEditorPage || !currentWebsite) return;

    // Extract pageId from pathname /editor/[id] format
    if (!pathname) return;
    const pathParts = pathname.split('/');
    let pageId = '';

    if (pathParts.length >= 3) {
      if (pathParts.length === 3) {
        // /editor/[id] format - id is websiteId, use first page
        if (currentWebsite?.pages && currentWebsite.pages.length > 0) {
          pageId = currentWebsite.pages[0].id;
        }
      } else if (pathParts.length >= 4) {
        // /editor/[websiteId]/[pageId] format
        pageId = pathParts[3];
      }
    }

    if (!pageId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: canvas.elements }),
      });

      if (!response.ok) {
        console.error(`Failed to save page ${pageId}`);
      }
    } catch (error) {
      console.error(`Error saving page ${pageId}:`, error);
    } finally {
      setIsSaving(false);
    }
  }, [isEditorPage, currentWebsite, pathname, canvas.elements]);

  // 프리뷰 페이지에서는 헤더를 렌더링하지 않음
  if (isPreviewPage) {
    return null;
  }

  return (
    <header className="px-5 py-[14px] bg-white border-b border-stone-300/50 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo/ditto.svg" alt="Ditto" width={32} height={32} />
            <Image
              src="/logo/ditto_text.svg"
              alt="Ditto"
              width={64}
              height={32}
            />
          </Link>
          {isEditorPage && currentWebsite && (
            <div>
              <h1 className="font-semibold text-gray-900">{currentWebsite.name}</h1>
              <p className="text-sm text-gray-600">
                {currentPageTitle || "페이지를 선택하세요"}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditorPage ? (
            <PageActions onSave={handleSave} isSaving={isSaving} />
          ) : (
            <AuthButton />
          )}
        </div>
      </div>
    </header>
  );
}