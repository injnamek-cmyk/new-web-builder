"use client";

import React, { useEffect } from "react";
import DragDropProvider from "@/features/drag-drop";
import Canvas from "./canvas";
import Toolbar from "./toolbar";
import PropertyPanel from "./property-panel";
import { useEditorStore } from "@/processes/editor-store";
import { Button } from "@/components/ui/button";
import {
  PanelLeft,
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

function LayoutContent() {
  const {
    toggleGrid,
    deleteSelectedElements,
    canvas,
    leftPanelVisible,
    rightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
  } = useEditorStore();

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

      // G키로 그리드 토글
      if (event.key === "g" || event.key === "G") {
        event.preventDefault();
        toggleGrid();
      }

      // Ctrl+1로 왼쪽 패널 토글
      if (event.ctrlKey && event.key === "1") {
        event.preventDefault();
        toggleLeftPanel();
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
  }, [
    toggleGrid,
    deleteSelectedElements,
    canvas.selectedElementIds,
    toggleLeftPanel,
    toggleRightPanel,
    resetCanvasZoom,
  ]);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* 상단 툴바 (모바일/태블릿) */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 overflow-x-auto">
        <Toolbar />
      </div>

      {/* 왼쪽 툴바 (데스크톱) */}
      <div
        className={`hidden lg:block bg-white border-r border-gray-200 p-4 overflow-y-auto transition-all duration-300 ${
          leftPanelVisible ? "w-64" : "w-0 p-0"
        }`}
      >
        {leftPanelVisible && <Toolbar />}
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

        {/* 패널 토글 버튼들 (데스크톱) */}
        <div className="hidden lg:flex absolute top-4 left-4 z-20 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLeftPanel}
            className="bg-white shadow-lg"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRightPanel}
            className="bg-white shadow-lg"
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
