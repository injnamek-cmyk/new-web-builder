"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEditorStore } from "@/processes/editor-store";
import { createElement, generateId } from "@/shared/lib/element-factory";
import { ElementType } from "@/shared/types";
import {
  Type,
  Image,
  Square,
  Container,
  Grid3X3,
  Group,
  Ungroup,
  PanelLeft,
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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
];

export default function Toolbar() {
  const {
    addElement,
    undo,
    redo,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearCanvas,
    toggleGrid,
    grid,
    groupSelectedElements,
    ungroupElement,
    canvas,
    leftPanelVisible,
    rightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
    canvasZoom,
    setCanvasZoom,
    resetCanvasZoom,
  } = useEditorStore();

  const handleAddElement = (type: ElementType) => {
    const element = createElement(type, generateId());
    addElement(element);
  };

  const handleGroupElements = () => {
    if (canvas.selectedElementIds.length >= 2) {
      groupSelectedElements();
    } else {
      alert("그룹화하려면 최소 2개 이상의 요소를 선택해야 합니다.");
    }
  };

  const handleUngroupElement = () => {
    const selectedElement = canvas.elements.find(
      (el) => el.id === canvas.selectedElementIds[0]
    );

    if (selectedElement && selectedElement.type === "container") {
      ungroupElement(selectedElement.id);
    } else {
      alert("그룹을 해제하려면 컨테이너 요소를 선택해야 합니다.");
    }
  };

  const isGroupable = canvas.selectedElementIds.length >= 2;
  const isUngroupable =
    canvas.selectedElementIds.length === 1 &&
    canvas.elements.find(
      (el) => el.id === canvas.selectedElementIds[0] && el.type === "container"
    );

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 hidden lg:block">
          요소 추가
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
          {elementTypes.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => handleAddElement(type)}
              className="flex items-center gap-2 text-xs lg:text-sm"
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 hidden lg:block">
          편집
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            className="text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">실행 취소</span>
            <span className="sm:hidden">취소</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            className="text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">다시 실행</span>
            <span className="sm:hidden">실행</span>
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGroupElements}
            disabled={!isGroupable}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <Group className="w-4 h-4" />
            <span className="hidden sm:inline">그룹화</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUngroupElement}
            disabled={!isUngroupable}
            className="flex items-center gap-2 text-xs lg:text-sm"
          >
            <Ungroup className="w-4 h-4" />
            <span className="hidden sm:inline">그룹 해제</span>
          </Button>
        </div>
      </div>

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

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 hidden lg:block">
          저장/불러오기
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={saveToLocalStorage}
            className="text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">저장</span>
            <span className="sm:hidden">저장</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFromLocalStorage}
            className="text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">불러오기</span>
            <span className="sm:hidden">불러오기</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">초기화</span>
            <span className="sm:hidden">초기화</span>
          </Button>
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
