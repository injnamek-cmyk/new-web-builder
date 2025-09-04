"use client";

import React, { useRef } from "react";
import { ImageElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
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

  const handleStyleChange = (property: keyof ImageElement, value: any) => {
    updateElement(element.id, { [property]: value });
  };

  return (
    <div
      className={`absolute cursor-pointer select-none ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
      }}
      onClick={onSelect}
    >
      {element.src ? (
        <img
          src={element.src}
          alt={element.alt}
          className="w-full h-full"
          style={{
            objectFit: element.objectFit,
          }}
        />
      ) : (
        <div
          className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
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
