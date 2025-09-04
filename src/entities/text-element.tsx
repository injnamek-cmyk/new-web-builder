"use client";

import React from "react";
import { TextElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
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
  const { updateElement } = useEditorStore();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
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
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        paddingTop: element.padding.top,
        paddingRight: element.padding.right,
        paddingBottom: element.padding.bottom,
        paddingLeft: element.padding.left,
        marginTop: element.margin.top,
        marginRight: element.margin.right,
        marginBottom: element.margin.bottom,
        marginLeft: element.margin.left,
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
