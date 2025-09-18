"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Type,
  Square,
  Container,
  Image as ImageIcon,
  ChevronDown,
  Calendar,
  ArrowLeftIcon,
} from "lucide-react";

import { useWebsiteStore } from "@/processes/website-store";
import { useEditorStore } from "@/processes/editor-store";
import { Page } from "@/shared/types";
import { StoredPageData } from "@/shared/types/server-driven-ui";
import { ElementType, Element } from "@/shared/types";
import {
  createElement,
  createShapeElement,
  generateId,
} from "@/shared/lib/element-factory";

import { ModeProvider } from "@/shared/contexts/mode-context";
import DragDropProvider from "@/features/drag-drop";

import { Button } from "@/components/ui/button";
import Canvas from "@/widgets/canvas";
import PropertyPanel from "@/widgets/property-panel";
import PageActions from "@/features/editor-controls/page-actions";
import ShapeDropdown from "@/components/shape-dropdown";
import { EditorPageTabs } from "@/widgets/editor-page-tabs";

interface WebsiteEditorLayoutProps {
  websiteId: string;
}

function WebsiteEditorLayoutContent({ websiteId }: WebsiteEditorLayoutProps) {
  const { currentWebsite, getWebsiteById, setCurrentWebsite } =
    useWebsiteStore();
  const {
    addElement,
    leftPanelVisible,
    toggleLeftPanel,
    rightPanelVisible,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
    initializeEditor,
    canvas,
  } = useEditorStore();

  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const savePage = useCallback(
    async (pageId: string, elements: Element[]) => {
      try {
        const response = await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: elements }),
        });

        if (response.ok) {
          if (currentWebsite) {
            const updatedPages = currentWebsite.pages.map((p) =>
              p.id === pageId ? { ...p, content: elements } : p
            );
            setCurrentWebsite({ ...currentWebsite, pages: updatedPages });
          }
        } else {
          console.error(`Failed to save page ${pageId}`);
        }
      } catch (error) {
        console.error(`Error saving page ${pageId}:`, error);
      }
    },
    [currentWebsite, setCurrentWebsite]
  );

  const handlePageSelect = useCallback(
    async (newPage: Page | null) => {
      if (currentPage && currentPage.id !== newPage?.id) {
        await savePage(currentPage.id, canvas.elements);
      }

      if (currentPage?.id === newPage?.id) return;

      setCurrentPage(newPage);

      if (newPage) {
        const freshPageData = currentWebsite?.pages.find(
          (p) => p.id === newPage.id
        );
        const elements = freshPageData?.content || newPage.content || [];

        const pageData: StoredPageData = {
          id: newPage.id,
          createdAt: newPage.createdAt,
          updatedAt: newPage.updatedAt,
          title: newPage.title || "Untitled",
          canvas: {
            width: 1920,
            height: 1080,
            elements: elements,
            selectedElementIds: [],
          },
        };
        initializeEditor(
          newPage.id,
          pageData.title,
          pageData.canvas,
          websiteId
        );
      } else {
        initializeEditor(
          "",
          "Untitled",
          {
            width: 1920,
            height: 1080,
            elements: [],
            selectedElementIds: [],
          },
          websiteId
        );
      }
    },
    [currentPage, canvas.elements, initializeEditor, currentWebsite, savePage]
  );

  useEffect(() => {
    let isMounted = true;
    const loadWebsite = async () => {
      if (websiteId) {
        setIsLoading(true);
        const website = await getWebsiteById(websiteId);
        if (isMounted && website) {
          setCurrentWebsite(website);
          if (website.pages && website.pages.length > 0) {
            // Just set the current page, don't call handlePageSelect to avoid double-saving
            const firstPage = website.pages[0];
            setCurrentPage(firstPage);
            const pageData: StoredPageData = {
              id: firstPage.id,
              createdAt: firstPage.createdAt,
              updatedAt: firstPage.updatedAt,
              title: firstPage.title || "Untitled",
              canvas: {
                width: 1920,
                height: 1080,
                elements: firstPage.content || [],
                selectedElementIds: [],
              },
            };
            initializeEditor(
              firstPage.id,
              pageData.title,
              pageData.canvas,
              websiteId
            );
          } else {
            setCurrentPage(null);
            initializeEditor(
              "",
              "Untitled",
              {
                width: 1920,
                height: 1080,
                elements: [],
                selectedElementIds: [],
              },
              websiteId
            );
          }
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadWebsite();

    return () => {
      isMounted = false;
    };
  }, [websiteId, getWebsiteById, setCurrentWebsite, initializeEditor]);

  const handleSave = async () => {
    if (!currentPage) return;
    setIsSaving(true);
    await savePage(currentPage.id, canvas.elements);
    setIsSaving(false);
  };

  const handleAddElement = (type: ElementType) => {
    const element = createElement(type, generateId());
    addElement(element);
  };

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle") => {
    const element = createShapeElement(shapeType, generateId());
    addElement(element);
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
            <Link href="/websites">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              웹사이트 목록으로
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  console.log(currentPage);

  return (
    <div className="h-screen flex flex-col relative bg-gray-50">
      {/* Header */}
      <header className="px-5 py-[14px] bg-white border-b border-stone-300/50 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/websites" className="flex items-center">
              <Image src="/logo/ditto.svg" alt="Ditto" width={32} height={32} />
              <Image
                src="/logo/ditto_text.svg"
                alt="Ditto"
                width={64}
                height={32}
              />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">
                {currentWebsite.name}
              </h1>
              <p className="text-sm text-gray-600">
                {currentPage ? currentPage.title : "페이지를 선택하세요"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PageActions onSave={handleSave} isSaving={isSaving} />
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {/* Left Panel */}
        <div
          className={`absolute top-0 left-0 h-full bg-white border-r border-stone-300/50 transition-all duration-300 z-40 ${
            leftPanelVisible ? "w-72" : "w-12"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLeftPanel}
            className="absolute -right-4 top-4 z-50 bg-white border-2 border-gray-200 shadow-lg hover:bg-gray-50"
          >
            {leftPanelVisible ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {leftPanelVisible && (
            <EditorPageTabs
              websiteId={websiteId}
              currentPageId={currentPage?.id}
              onPageSelect={handlePageSelect}
            />
          )}
        </div>

        {/* Right Panel */}
        <div
          className={`absolute top-0 right-0 h-full bg-white border-l border-stone-300/50 transition-all duration-300 z-40 ${
            rightPanelVisible ? "w-72" : "w-12"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRightPanel}
            className="absolute -left-4 top-4 z-50 bg-white border-2 border-gray-200 shadow-lg hover:bg-gray-50"
          >
            {rightPanelVisible ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {rightPanelVisible &&
            currentPage &&
            canvas.selectedElementIds.length > 0 && (
              <div className="p-4 h-full overflow-y-auto">
                <PropertyPanel />
              </div>
            )}
        </div>

        {/* Canvas */}
        <div
          className="h-full transition-all duration-300"
          style={{
            marginLeft: leftPanelVisible ? "288px" : "48px",
            marginRight: rightPanelVisible ? "288px" : "48px",
          }}
        >
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

        {/* Bottom Toolbar */}
        {currentPage && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("text")}
              >
                <Type className="w-4 h-4 mr-1" /> 텍스트
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("image")}
              >
                <ImageIcon className="w-4 h-4 mr-1" /> 이미지
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("button")}
              >
                <Square className="w-4 h-4 mr-1" /> 버튼
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("container")}
              >
                <Container className="w-4 h-4 mr-1" /> 컨테이너
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("accordion")}
              >
                <ChevronDown className="w-4 h-4 mr-1" /> 아코디언
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("calendar")}
              >
                <Calendar className="w-4 h-4 mr-1" /> 캘린더
              </Button>
              <ShapeDropdown onShapeSelect={handleAddShape} />
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        {currentPage && (
          <div className="absolute bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCanvasZoom(canvasZoom - 0.1)}
                disabled={canvasZoom <= 0.1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCanvasZoom}
                className="min-w-[60px]"
              >
                {Math.round(canvasZoom * 100)}%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCanvasZoom(canvasZoom + 0.1)}
                disabled={canvasZoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WebsiteEditorLayout({
  websiteId,
}: WebsiteEditorLayoutProps) {
  return (
    <ModeProvider mode="editor">
      <DragDropProvider>
        <WebsiteEditorLayoutContent websiteId={websiteId} />
      </DragDropProvider>
    </ModeProvider>
  );
}
