"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import DragDropProvider from "@/features/drag-drop";
import { useEditorStore } from "@/processes/editor-store";
import { ModeProvider } from "@/shared/contexts/mode-context";
import { createElement, createShapeElement, generateId } from "@/shared/lib/element-factory";
import { ElementType } from "@/shared/types";
import { StoredPageData } from "@/shared/types/server-driven-ui";
import Canvas from "@/widgets/canvas";
import PropertyPanel from "@/widgets/property-panel";
import LeftNavigation from "@/components/navigation/left-navigation";
import PageActions from "@/features/editor-controls/page-actions";
import ShapeDropdown from "@/components/shape-dropdown";

interface NewEditorLayoutProps {
  initialPageData: StoredPageData;
  pageId: string;
}

function NewEditorLayoutContent({ initialPageData, pageId }: NewEditorLayoutProps) {
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

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle") => {
    const element = createShapeElement(shapeType, generateId());
    addElement(element);
  };

  return (
    <div className="h-screen flex flex-col relative bg-gray-50">
      {/* 헤더 */}
      <header className="px-5 py-[14px] bg-white border-b border-stone-300/50 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex">
            <Image src="/logo/ditto.svg" alt="Ditto" width={32} height={32} />
            <Image
              src="/logo/ditto_text.svg"
              alt="Ditto"
              width={64}
              height={32}
            />
          </div>
          <PageActions />
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {/* 좌측 네비게이션/사이드 메뉴 - 접을 수 있게 절대 위치로 */}
        <div
          className={`absolute top-0 left-0 h-full bg-white border-r border-stone-300/50 transition-all duration-300 z-40 ${
            leftPanelVisible ? "w-72" : "w-12"
          }`}
        >
          {/* 좌측 패널 토글 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLeftPanel}
            className="absolute -right-4 top-4 z-50 bg-white border-2 border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-200"
          >
            {leftPanelVisible ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {leftPanelVisible && <LeftNavigation />}
        </div>

        {/* 우측 속성 패널 - 접을 수 있게 절대 위치로 */}
        <div
          className={`absolute top-0 right-0 h-full bg-white border-l border-stone-300/50 transition-all duration-300 z-40 ${
            rightPanelVisible ? "w-72" : "w-12"
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

        {/* 중앙 캔버스 영역 */}
        <div
          className="h-full transition-all duration-300"
          style={{
            marginLeft: leftPanelVisible ? "288px" : "48px",
            marginRight: rightPanelVisible ? "288px" : "48px",
          }}
        >
          <Canvas />
        </div>

        {/* 하단 툴바 - 요소 추가 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("text")}
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              텍스트
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("image")}
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              이미지
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("button")}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              버튼
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("container")}
              className="flex items-center gap-2"
            >
              <Container className="w-4 h-4" />
              컨테이너
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("accordion")}
              className="flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              아코디언
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddElement("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              캘린더
            </Button>
            <ShapeDropdown onShapeSelect={handleAddShape} />
          </div>
        </div>

        {/* 줌 컨트롤 */}
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
      </div>
    </div>
  );
}

export default function NewEditorLayout({ initialPageData, pageId }: NewEditorLayoutProps) {
  return (
    <ModeProvider mode="editor">
      <DragDropProvider>
        <NewEditorLayoutContent initialPageData={initialPageData} pageId={pageId} />
      </DragDropProvider>
    </ModeProvider>
  );
}