"use client";

import React from "react";
import { ContainerElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };

  // 드래그 오버레이를 위한 원본 크기 (패딩 제외)
  const originalWidth = element.width === "auto" ? 100 : element.width;
  const originalHeight = element.height === "auto" ? 100 : element.height;

  // 실제 표시 크기 (패딩 포함)
  const actualWidth =
    element.width === "auto"
      ? "auto"
      : Math.max(element.width + safePadding.left + safePadding.right, 20);
  const actualHeight =
    element.height === "auto"
      ? "auto"
      : Math.max(element.height + safePadding.top + safePadding.bottom, 20);

  // Container 스타일
  const containerStyle = {
    width: element.width === "auto" ? "auto" : "100%",
    height: element.height === "auto" ? "auto" : "100%",
    position: "relative" as const,
    minWidth: element.width === "auto" ? "fit-content" : 20,
    minHeight: element.height === "auto" ? "fit-content" : 20,
    backgroundColor: element.backgroundColor,
    borderRadius: `${element.borderRadius}px`,
    borderStyle: element.borderStyle || "none",
    borderWidth: element.borderWidth ? `${element.borderWidth}px` : "0",
    borderColor: element.borderColor || "transparent",
    boxShadow: getBoxShadowValue(element.boxShadow),
    paddingTop: safePadding.top,
    paddingRight: safePadding.right,
    paddingBottom: safePadding.bottom,
    paddingLeft: safePadding.left,
  };

  function getBoxShadowValue(shadowType?: string) {
    const shadows = {
      none: "none",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
    };
    return shadows[shadowType as keyof typeof shadows] || shadows.none;
  }

  return (
    <div
      className={cn(
        "absolute cursor-pointer select-none",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      style={{
        left: element.x,
        top: element.y,
        width: originalWidth,
        height: originalHeight,
        zIndex: element.zIndex,
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : undefined,
        minHeight: element.height === "auto" ? "fit-content" : undefined,
      }}
      onClick={onSelect}
    >
      <div 
        style={containerStyle} 
        className="w-full h-full flex items-center justify-center text-muted-foreground text-sm"
      >
        컨테이너
      </div>
    </div>
  );
}
