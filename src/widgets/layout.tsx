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
import {
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Type,
  Image,
  Square,
  Container,
  ChevronDown,
  Calendar,
} from "lucide-react";

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
];

function LayoutContent() {
  const {
    addElement,
    rightPanelVisible,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
  } = useEditorStore();

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
    <div className="h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* 상단 +Add 버튼 (모바일/태블릿) */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg rounded-full px-6 py-3 font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                +Add Element
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
        </div>
      </div>

      {/* 중앙 캔버스 영역 */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* 줌 컨트롤 (데스크톱) */}
        <div className="hidden lg:flex absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg p-2 gap-1">
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

        {/* +Add 드롭다운 버튼 (데스크톱) */}
        <div className="hidden lg:flex absolute top-6 left-6 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl rounded-full px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <Plus className="w-6 h-6 mr-3" />
                +Add Element
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
        </div>

        {/* 패널 토글 버튼들 (데스크톱) */}
        <div className="hidden lg:flex absolute top-6 right-6 z-20 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRightPanel}
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
          >
            <PanelRight className="w-4 h-4" />
          </Button>
        </div>

        <Canvas />
      </div>

      {/* 하단 속성 패널 (모바일/태블릿) */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-4 max-h-64 overflow-y-auto">
        <PropertyPanel />
      </div>

      {/* 오른쪽 속성 패널 (데스크톱) */}
      <div
        className={`hidden lg:block bg-white border-l border-gray-200 p-4 overflow-y-auto transition-all duration-300 ${
          rightPanelVisible ? "w-80" : "w-0 p-0"
        }`}
      >
        {rightPanelVisible && <PropertyPanel />}
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <DragDropProvider>
      <LayoutContent />
    </DragDropProvider>
  );
}
