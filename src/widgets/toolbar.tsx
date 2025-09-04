"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEditorStore } from "@/processes/editor-store";
import { createElement, generateId } from "@/shared/lib/element-factory";
import { ElementType } from "@/shared/types";
import { Type, Image, Square, Container, Grid3X3 } from "lucide-react";

const elementTypes: {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "text", label: "텍스트", icon: <Type className="w-4 h-4" /> },
  { type: "image", label: "이미지", icon: <Image className="w-4 h-4" /> },
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
  } = useEditorStore();

  const handleAddElement = (type: ElementType) => {
    const element = createElement(type, generateId());
    addElement(element);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">요소 추가</h3>
        <div className="grid grid-cols-2 gap-2">
          {elementTypes.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => handleAddElement(type)}
              className="flex items-center gap-2"
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">편집</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={undo}>
            실행 취소
          </Button>
          <Button variant="outline" size="sm" onClick={redo}>
            다시 실행
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">보기</h3>
        <div className="flex gap-2">
          <Button
            variant={grid.showGrid ? "default" : "outline"}
            size="sm"
            onClick={toggleGrid}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            그리드 {grid.showGrid ? "끄기" : "켜기"} (G)
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">저장/불러오기</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
            저장
          </Button>
          <Button variant="outline" size="sm" onClick={loadFromLocalStorage}>
            불러오기
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            초기화
          </Button>
        </div>
      </div>
    </Card>
  );
}
