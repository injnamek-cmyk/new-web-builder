"use client";

import React from "react";
import { TextElement } from "@/shared/types";
import { cn } from "@/lib/utils";

interface TextElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function TextElementComponent({
  element,
  isSelected,
  onSelect,
}: TextElementProps) {
  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const actualWidth =
    element.width === "auto"
      ? "auto"
      : element.width + element.padding.left + element.padding.right;
  const actualHeight =
    element.height === "auto"
      ? "auto"
      : element.height + element.padding.top + element.padding.bottom;

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
        paddingTop: element.padding.top,
        paddingRight: element.padding.right,
        paddingBottom: element.padding.bottom,
        paddingLeft: element.padding.left,
        position: "relative",
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : undefined,
        minHeight: element.height === "auto" ? "fit-content" : undefined,
      }}
      onClick={onSelect}
    >
      <div
        className={cn(
          element.width === "auto" ? "w-auto" : "w-full",
          element.height === "auto" ? "h-auto" : "h-full"
        )}
        style={{
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          color: element.color,
          textAlign: element.textAlign,
          fontWeight: element.fontWeight,
          minWidth: element.width === "auto" ? "fit-content" : 20,
          minHeight: element.height === "auto" ? "fit-content" : 20,
        }}
      >
        {element.content || "텍스트를 입력하세요"}
      </div>
    </div>
  );
}
