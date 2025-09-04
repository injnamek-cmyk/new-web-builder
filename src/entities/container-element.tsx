"use client";

import React from "react";
import { ContainerElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";

interface ContainerElementProps {
  element: ContainerElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function ContainerElementComponent({
  element,
  isSelected,
  onSelect,
}: ContainerElementProps) {
  const { updateElement } = useEditorStore();

  const handleStyleChange = (property: keyof ContainerElement, value: any) => {
    updateElement(element.id, { [property]: value });
  };

  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const actualWidth =
    element.width + element.padding.left + element.padding.right;
  const actualHeight =
    element.height + element.padding.top + element.padding.bottom;

  const containerStyle = {
    backgroundColor: element.backgroundColor,
    borderRadius: element.borderRadius,
    paddingTop: element.padding.top,
    paddingRight: element.padding.right,
    paddingBottom: element.padding.bottom,
    paddingLeft: element.padding.left,
    width: "100%",
    height: "100%",
    position: "relative" as const,
  };

  return (
    <div
      className={cn(
        "absolute cursor-pointer select-none",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      style={{
        left: element.x,
        top: element.y,
        width: actualWidth,
        height: actualHeight,
        zIndex: element.zIndex,
      }}
      onClick={onSelect}
    >
      <div style={containerStyle} className="border border-gray-300">
        {element.children.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            컨테이너
          </div>
        )}
      </div>
    </div>
  );
}
