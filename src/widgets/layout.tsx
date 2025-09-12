"use client";

import React, { useEffect } from "react";
import DragDropProvider from "@/features/drag-drop";
import Canvas from "./canvas";
import PropertyPanel from "./property-panel";
import { useEditorStore } from "@/processes/editor-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createElement, generateId } from "@/shared/lib/element-factory";
import { ElementType } from "@/shared/types";
import { StoredPageData } from "@/shared/types/server-driven-ui";
import PageActions from "@/features/editor-controls/page-actions";
import WebsiteGeneratorButton from "@/features/editor-controls/website-generator-button";
import {
  ZoomIn,
  ZoomOut,
  Plus,
  Type,
  Image,
  Square,
  Container,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shapes,
} from "lucide-react";

interface LayoutProps {
  initialPageData: StoredPageData;
  pageId: string;
}

const elementTypes: {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "text", label: "텍스트", icon: <Type className="w-4 h-4" /> },
  {
    type: "image",
    label: "이미지",
    icon: <Image className="w-4 h-4" aria-label="이미지 아이콘" />,
  },
  { type: "button", label: "버튼", icon: <Square className="w-4 h-4" /> },
  {
    type: "container",
    label: "컨테이너",
    icon: <Container className="w-4 h-4" />,
  },
  {
    type: "accordion",
    label: "아코디언",
    icon: <ChevronDown className="w-4 h-4" />,
  },
  {
    type: "calendar",
    label: "캘린더",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    type: "shape",
    label: "도형",
    icon: <Shapes className="w-4 h-4" />,
  },
];

function LayoutContent({ initialPageData, pageId }: LayoutProps) {
  const {
    addElement,
    rightPanelVisible,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
    initializeEditor,
  } = useEditorStore();

  useEffect(() => {
    if (initialPageData && pageId) {
      const { title, canvas } = initialPageData;
      initializeEditor(pageId, title, canvas);
    }
  }, [initialPageData, pageId, initializeEditor]);

  const handleAddElement = (type: ElementType) => {
    const element = createElement(type, generateId());
    addElement(element);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에 포커스가 있지 않을 때만 실행
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.contentEditable === "true";

      if (isInputFocused) {
        return; // 입력 필드에 포커스가 있으면 키보드 이벤트 무시
      }

      // Ctrl+2로 오른쪽 패널 토글
      if (event.ctrlKey && event.key === "2") {
        event.preventDefault();
        toggleRightPanel();
      }

      // Ctrl+0으로 줌 리셋
      if (event.ctrlKey && event.key === "0") {
        event.preventDefault();
        resetCanvasZoom();
      }

      // 백스페이스 키로 선택된 요소 삭제 방지
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleRightPanel, resetCanvasZoom]);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-100 relative">
      {/* 상단 +Add 버튼 (모바일/태블릿) */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg rounded-full px-6 py-3 font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Element
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {elementTypes.map(({ type, label, icon }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleAddElement(type)}
                  className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-gray-50 transition-colors"
                >
                  {icon}
                  <span className="font-medium">{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <PageActions className="text-sm" />
            <WebsiteGeneratorButton className="text-sm px-4 py-2" />
          </div>
        </div>
      </div>

      {/* 중앙 캔버스 영역 */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* 상단 컨트롤 버튼들 (데스크톱) */}
        <div className="hidden lg:flex absolute top-6 left-6 z-20 gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl rounded-full px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <Plus className="w-6 h-6 mr-3" />
                Add Element
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 mt-2 shadow-2xl border-0 rounded-xl"
            >
              {elementTypes.map(({ type, label, icon }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleAddElement(type)}
                  className="flex items-center gap-4 cursor-pointer py-4 px-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                    {icon}
                  </div>
                  <span className="font-medium text-gray-700">{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <PageActions className="px-4 py-2" />
            <WebsiteGeneratorButton className="px-4 py-2" />
          </div>
        </div>

        <Canvas />
      </div>

      {/* 하단 속성 패널 (모바일/태블릿) */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-4 max-h-64 overflow-y-auto">
        <PropertyPanel />
      </div>

      {/* 줌 컨트롤 (데스크톱) - 하단 가운데로 이동 */}
      <div className="hidden lg:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-2 gap-1">
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

      {/* 오른쪽 속성 패널 (데스크톱) - 오버레이로 변경 */}
      <div
        className={`hidden lg:block absolute top-0 right-0 h-full bg-white border-l border-gray-200 transition-all duration-300 z-40 ${
          rightPanelVisible ? "w-80" : "w-12"
        }`}
      >
        {/* 속성 패널 토글 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleRightPanel}
          className="absolute -left-4 top-4 z-50 bg-white border-2 border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-200"
        >
          {rightPanelVisible ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        {rightPanelVisible && (
          <div className="p-4 h-full overflow-y-auto">
            <PropertyPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Layout({ initialPageData, pageId }: LayoutProps) {
  return (
    <DragDropProvider>
      <LayoutContent initialPageData={initialPageData} pageId={pageId} />
    </DragDropProvider>
  );
}
