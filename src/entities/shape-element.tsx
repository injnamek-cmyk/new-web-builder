"use client";

import React, { useEffect, useState } from "react";
import { ShapeElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { Shape } from "@/components/ui/shape";

interface ShapeElementProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function ShapeElementComponent({
  element,
  isSelected,
  onSelect,
}: ShapeElementProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };

  const actualWidth =
    element.width === "auto"
      ? "auto"
      : Math.max((element.width as number) + safePadding.left + safePadding.right, 20);
  const actualHeight =
    element.height === "auto"
      ? "auto"
      : Math.max((element.height as number) + safePadding.top + safePadding.bottom, 20);

  if (!isClient) {
    return (
      <div
        className="absolute cursor-pointer select-none"
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
        <div
          style={{
            width: element.width === "auto" ? "100px" : element.width,
            height: element.height === "auto" ? "100px" : element.height,
            backgroundColor: element.backgroundColor,
          }}
          className="w-full h-full"
        />
      </div>
    );
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
        width: actualWidth,
        height: actualHeight,
        zIndex: element.zIndex,
        position: "absolute",
        minWidth: element.width === "auto" ? "fit-content" : 20,
        minHeight: element.height === "auto" ? "fit-content" : 20,
        padding: `${safePadding.top}px ${safePadding.right}px ${safePadding.bottom}px ${safePadding.left}px`,
      }}
      onClick={onSelect}
      suppressHydrationWarning={true}
    >
      <Shape
        shapeType={element.shapeType}
        width={element.width === "auto" ? 100 : (element.width as number)}
        height={element.height === "auto" ? 100 : (element.height as number)}
        backgroundColor={element.backgroundColor}
        borderColor={element.borderColor}
        borderWidth={element.borderWidth}
        borderStyle={element.borderStyle}
        borderRadius={element.borderRadius}
        suppressHydrationWarning={true}
      />
    </div>
  );
}