"use client";

import React from "react";
import { ButtonElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ButtonElementProps {
  element: ButtonElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function ButtonElementComponent({
  element,
  isSelected,
  onSelect,
}: ButtonElementProps) {
  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };

  const actualWidth =
    element.width === "auto"
      ? "auto"
      : Math.max(element.width + safePadding.left + safePadding.right, 20);
  const actualHeight =
    element.height === "auto"
      ? "auto"
      : Math.max(element.height + safePadding.top + safePadding.bottom, 20);

  // shadcn Button 컴포넌트에 전달할 스타일
  const buttonStyle = {
    width: element.width === "auto" ? "auto" : "100%",
    height: element.height === "auto" ? "auto" : "100%",
    minWidth: element.width === "auto" ? "fit-content" : 20,
    minHeight: element.height === "auto" ? "fit-content" : 20,
    backgroundColor: element.backgroundColor,
    color: element.textColor,
    borderRadius: `${element.borderRadius}px`,
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
        position: "absolute",
        minWidth: element.width === "auto" ? "fit-content" : 20,
        minHeight: element.height === "auto" ? "fit-content" : 20,
      }}
      onClick={onSelect}
    >
      <Button
        style={buttonStyle}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (element.href) {
            window.open(element.href, "_blank");
          }
        }}
        className="w-full h-full"
      >
        {element.text || "버튼"}
      </Button>
    </div>
  );
}
