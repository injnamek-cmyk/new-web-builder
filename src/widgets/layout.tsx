"use client";

import React from "react";
import DragDropProvider from "@/features/drag-drop";
import Canvas from "./canvas";
import Toolbar from "./toolbar";
import PropertyPanel from "./property-panel";

export default function Layout() {
  return (
    <DragDropProvider>
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
    </DragDropProvider>
  );
}
