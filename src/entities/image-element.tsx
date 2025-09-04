"use client";

import React, { useRef } from "react";
import { ImageElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";
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
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : undefined,
        minHeight: element.height === "auto" ? "fit-content" : undefined,
      }}
      onClick={onSelect}
    >
      {element.src ? (
        <Image
          src={element.src}
          alt={element.alt}
          className={cn(
            element.width === "auto" ? "w-auto" : "w-full",
            element.height === "auto" ? "h-auto" : "h-full"
          )}
          style={{
            objectFit: element.objectFit,
            minWidth: element.width === "auto" ? "fit-content" : undefined,
            minHeight: element.height === "auto" ? "fit-content" : undefined,
          }}
          width={element.width === "auto" ? undefined : element.width}
          height={element.height === "auto" ? undefined : element.height}
        />
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
