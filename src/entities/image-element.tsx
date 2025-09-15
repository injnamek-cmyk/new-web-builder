"use client";

import React, { useRef } from "react";
import { ImageElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn, getValidPaddingValue } from "@/lib/utils";
import Image from "next/image";

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function ImageElementComponent({
  element,
  isSelected,
  onSelect,
}: ImageElementProps) {
  const { updateElement } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateElement(element.id, { src: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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
        paddingTop: safePadding.top,
        paddingRight: safePadding.right,
        paddingBottom: safePadding.bottom,
        paddingLeft: safePadding.left,
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : 20,
        minHeight: element.height === "auto" ? "fit-content" : 20,
      }}
      onClick={onSelect}
    >
      {element.src ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {element.width === "auto" || element.height === "auto" ? (
            <Image
              src={element.src}
              alt={element.alt}
              fill
              style={{
                objectFit: element.objectFit,
                objectPosition: element.objectPosition || "center",
                filter: element.filter ? `brightness(${element.filter.brightness}%) contrast(${element.filter.contrast}%) saturate(${element.filter.saturate}%) blur(${element.filter.blur}px)` : undefined,
              }}
            />
          ) : (
            <Image
              src={element.src}
              alt={element.alt}
              width={element.width}
              height={element.height}
              className={cn("w-full h-full")}
              style={{
                objectFit: element.objectFit,
                objectPosition: element.objectPosition || "center",
                filter: element.filter ? `brightness(${element.filter.brightness}%) contrast(${element.filter.contrast}%) saturate(${element.filter.saturate}%) blur(${element.filter.blur}px)` : undefined,
              }}
            />
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50",
            element.width === "auto" ? "w-auto" : "w-full",
            element.height === "auto" ? "h-auto" : "h-full"
          )}
          style={{
            minWidth: element.width === "auto" ? "fit-content" : undefined,
            minHeight: element.height === "auto" ? "fit-content" : undefined,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📷</div>
            <div>이미지를 클릭하여 업로드</div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
