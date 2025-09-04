"use client";

import React from "react";
import { ButtonElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";

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
  const { updateElement } = useEditorStore();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, { text: e.target.value });
  };

  const buttonStyle = {
    backgroundColor: element.backgroundColor,
    color: element.textColor,
    borderRadius: element.borderRadius,
    paddingTop: element.padding.top,
    paddingRight: element.padding.right,
    paddingBottom: element.padding.bottom,
    paddingLeft: element.padding.left,
    width: "100%",
    height: "100%",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
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
        marginTop: element.margin.top,
        marginRight: element.margin.right,
        marginBottom: element.margin.bottom,
        marginLeft: element.margin.left,
      }}
      onClick={onSelect}
    >
      {isSelected ? (
        <input
          type="text"
          value={element.text}
          onChange={handleTextChange}
          className="w-full h-full text-center border-none outline-none"
          style={buttonStyle}
          autoFocus
        />
      ) : (
        <button
          style={buttonStyle}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (element.href) {
              window.open(element.href, "_blank");
            }
          }}
        >
          {element.text || "버튼"}
        </button>
      )}
    </div>
  );
}
