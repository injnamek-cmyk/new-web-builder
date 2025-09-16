"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWebsiteStore } from "@/processes/website-store";
import { EditorPageTabs } from "@/widgets/editor-page-tabs";
import Canvas from "@/widgets/canvas";
import PropertyPanel from "@/widgets/property-panel";
import { useEditorStore } from "@/processes/editor-store";
import { Page } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const params = useParams();
  const websiteId = params?.id as string;

  const { currentWebsite, getWebsiteById, setCurrentWebsite } =
    useWebsiteStore();
  const { canvas, setCanvas, selectedElementIds } = useEditorStore();

  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadWebsite = async () => {
      if (websiteId) {
        setIsLoading(true);
        const website = await getWebsiteById(websiteId);
        if (website) {
          setCurrentWebsite(website);
          setIsLoading(false);
        } else {
          // 웹사이트를 찾을 수 없음
          setIsLoading(false);
        }
      }
    };

    loadWebsite();
  }, [websiteId, getWebsiteById, setCurrentWebsite]);

  const handlePageSelect = (page: Page) => {
    setCurrentPage(page);
    // 페이지 콘텐츠를 캔버스에 로드
    setCanvas({
      ...canvas,
      elements: page.content || [],
      selectedElementIds: [],
    });
  };

  const handleSave = async () => {
    if (!currentPage) return;

    setIsSaving(true);
    try {
      // 현재 캔버스 상태를 페이지에 저장
      const response = await fetch(`/api/pages/${currentPage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: canvas.elements,
        }),
      });

      if (response.ok) {
        // 성공적으로 저장됨
        console.log("Page saved successfully");
      } else {
        console.error("Failed to save page");
      }
    } catch (error) {
      console.error("Error saving page:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">에디터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentWebsite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            웹사이트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            요청하신 웹사이트가 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              웹사이트 목록으로
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              돌아가기
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">
              {currentWebsite.name}
            </h1>
            <p className="text-sm text-gray-600">
              {currentPage ? currentPage.title : "페이지를 선택하세요"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentPage && (
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <SaveIcon className="w-4 h-4 mr-2" />
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          )}
        </div>
      </header>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 페이지 탭 */}
        <div className="w-80 border-r bg-white flex flex-col">
          <EditorPageTabs
            websiteId={websiteId}
            currentPageId={currentPage?.id}
            onPageSelect={handlePageSelect}
          />
        </div>

        {/* 메인 캔버스 영역 */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-auto">
            {currentPage ? (
              <Canvas />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    페이지를 선택하세요
                  </h2>
                  <p className="text-gray-600">
                    왼쪽에서 편집할 페이지를 선택하거나 새 페이지를 생성하세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 속성 패널 */}
          {currentPage && selectedElementIds.length > 0 && (
            <div className="w-80 border-l bg-white">
              <PropertyPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
