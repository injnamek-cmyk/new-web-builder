"use client";

import React from "react";
import { TextElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";

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
  const { updateElement } = useEditorStore();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
  };

  const handleStyleChange = (property: keyof TextElement, value: any) => {
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
      {isSelected ? (
        <textarea
          value={element.content}
          onChange={handleContentChange}
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
          }}
          autoFocus
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
          }}
        >
          {element.content || "텍스트를 입력하세요"}
        </div>
      )}
    </div>
  );
}
