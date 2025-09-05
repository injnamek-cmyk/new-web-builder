"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEditorStore } from "@/processes/editor-store";
import {
  Grid3X3,
  PanelLeft,
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export default function Toolbar() {
  const {
    toggleGrid,
    grid,
    leftPanelVisible,
    rightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
  } = useEditorStore();

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 hidden lg:block">
          보기
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={grid.showGrid ? "default" : "outline"}
            size="sm"
            onClick={toggleGrid}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">
              그리드 {grid.showGrid ? "끄기" : "켜기"} (G)
            </span>
            <span className="sm:hidden">그리드</span>
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCanvasZoom(Math.min(3, canvasZoom * 1.2))}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden sm:inline">줌인</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCanvasZoom(Math.max(0.1, canvasZoom * 0.8))}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="hidden sm:inline">줌아웃</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetCanvasZoom}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">100%</span>
          </Button>
        </div>
        <div className="text-xs text-gray-500 hidden lg:block">
          줌: {Math.round(canvasZoom * 100)}% | Ctrl/Cmd + 휠로 줌
        </div>
        <div className="text-xs text-gray-500 lg:hidden">
          {Math.round(canvasZoom * 100)}%
        </div>
      </div>

      {/* 패널 토글 버튼들 (모바일/태블릿) */}
      <div className="space-y-2 lg:hidden">
        <h3 className="text-sm font-medium text-gray-700">패널</h3>
        <div className="flex gap-2">
          <Button
            variant={leftPanelVisible ? "default" : "outline"}
            size="sm"
            onClick={toggleLeftPanel}
            className="flex items-center gap-2 text-xs"
          >
            <PanelLeft className="w-4 h-4" />
            왼쪽 패널
          </Button>
          <Button
            variant={rightPanelVisible ? "default" : "outline"}
            size="sm"
            onClick={toggleRightPanel}
            className="flex items-center gap-2 text-xs"
          >
            <PanelRight className="w-4 h-4" />
            오른쪽 패널
          </Button>
        </div>
      </div>
    </Card>
  );
}
