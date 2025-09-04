"use client";

import React, { useEffect } from "react";
import DragDropProvider from "@/features/drag-drop";
import Canvas from "./canvas";
import Toolbar from "./toolbar";
import PropertyPanel from "./property-panel";
import { useEditorStore } from "@/processes/editor-store";

function LayoutContent() {
  const { toggleGrid } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // G키로 그리드 토글
      if (event.key === "g" || event.key === "G") {
        // 입력 필드에 포커스가 있지 않을 때만 실행
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          event.preventDefault();
          toggleGrid();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleGrid]);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* 왼쪽 툴바 */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <Toolbar />
      </div>

      {/* 중앙 캔버스 */}
      <div className="flex-1 flex flex-col">
        <Canvas />
      </div>

      {/* 오른쪽 속성 패널 */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <PropertyPanel />
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
