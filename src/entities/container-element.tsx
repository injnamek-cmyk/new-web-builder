"use client";

import React from "react";
import { ContainerElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { useEditorStore } from "@/processes/editor-store";

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
  const { canvas } = useEditorStore();

  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };

  // 드래그 오버레이를 위한 원본 크기 (패딩 제외)
  const originalWidth = element.width === "auto" ? 200 : element.width;
  const originalHeight = element.height === "auto" ? 100 : element.height;

  // 자식 요소들 찾기
  const childrenElements = element.children
    ?.map((childId) => canvas.elements.find((el) => el.id === childId))
    .filter(Boolean) || [];

  // Flex 속성
  const flexDirection = element.flex?.flexDirection || "row";
  const justifyContent = element.flex?.justifyContent || "flex-start";
  const alignItems = element.flex?.alignItems || "stretch";
  const gap = element.gap || 8;

  // Container 스타일
  const containerStyle: React.CSSProperties = {
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
    padding: `${safePadding.top}px ${safePadding.right}px ${safePadding.bottom}px ${safePadding.left}px`,
    display: "flex",
    flexDirection,
    justifyContent,
    alignItems,
    gap: `${gap}px`,
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

  const renderChildElement = (childElement: any) => {
    // 자식 요소는 상대 위치로 렌더링
    switch (childElement.type) {
      case "text":
        return (
          <div 
            key={childElement.id}
            style={{
              fontSize: `${childElement.fontSize}px`,
              fontFamily: childElement.fontFamily,
              color: childElement.color,
              textAlign: childElement.textAlign,
              fontWeight: childElement.fontWeight,
              textDecoration: childElement.textDecoration,
              lineHeight: childElement.lineHeight,
            }}
          >
            {childElement.content}
          </div>
        );
      case "button":
        return (
          <button
            key={childElement.id}
            style={{
              backgroundColor: childElement.backgroundColor,
              color: childElement.textColor,
              borderRadius: `${childElement.borderRadius}px`,
              padding: `${childElement.padding.top}px ${childElement.padding.right}px ${childElement.padding.bottom}px ${childElement.padding.left}px`,
              border: "none",
              cursor: "pointer",
            }}
          >
            {childElement.text}
          </button>
        );
      default:
        return (
          <div key={childElement.id} className="bg-gray-200 p-2 rounded">
            {childElement.type}
          </div>
        );
    }
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
        width: originalWidth,
        height: originalHeight,
        zIndex: element.zIndex,
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : undefined,
        minHeight: element.height === "auto" ? "fit-content" : undefined,
      }}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {childrenElements.length > 0 ? (
          childrenElements.map(renderChildElement)
        ) : (
          <div className="text-muted-foreground text-sm opacity-50">
            자식 요소를 추가하세요
          </div>
        )}
      </div>
    </div>
  );
}
