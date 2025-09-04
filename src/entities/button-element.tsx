"use client";

import React from "react";
import { ButtonElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";

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

  const handleStyleChange = (property: keyof ButtonElement, value: any) => {
    updateElement(element.id, { [property]: value });
  };

  const buttonStyle = {
    backgroundColor: element.backgroundColor,
    color: element.textColor,
    borderRadius: element.borderRadius,
    padding: element.padding,
    width: "100%",
    height: "100%",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
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
          onClick={(e) => {
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
