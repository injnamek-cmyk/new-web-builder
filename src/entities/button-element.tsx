"use client";

import React from "react";
import { ButtonElement, Element } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn, getValidPaddingValue } from "@/lib/utils";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ContainerElementComponent from "@/entities/container-element";

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
  const { updateElement, getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, { text: e.target.value });
  };

  // 자식 요소 렌더링 함수
  const renderChildElement = (childElement: Element) => {
    const isChildSelected = false; // 자식 요소는 별도로 선택되지 않음
    const onChildSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      selectElement(childElement.id);
    };

    switch (childElement.type) {
      case "text":
        return (
          <DraggableElement key={childElement.id} element={childElement}>
            <TextElementComponent
              element={childElement}
              isSelected={isChildSelected}
              onSelect={onChildSelect}
            />
          </DraggableElement>
        );
      case "image":
        return (
          <DraggableElement key={childElement.id} element={childElement}>
            <ImageElementComponent
              element={childElement}
              isSelected={isChildSelected}
              onSelect={onChildSelect}
            />
          </DraggableElement>
        );
      case "button":
        return (
          <DraggableElement key={childElement.id} element={childElement}>
            <ButtonElementComponent
              element={childElement}
              isSelected={isChildSelected}
              onSelect={onChildSelect}
            />
          </DraggableElement>
        );
      case "container":
        return (
          <DraggableElement key={childElement.id} element={childElement}>
            <ContainerElementComponent
              element={childElement}
              isSelected={isChildSelected}
              onSelect={onChildSelect}
            />
          </DraggableElement>
        );
      default:
        return null;
    }
  };

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

  const buttonStyle = {
    backgroundColor: element.backgroundColor,
    color: element.textColor,
    borderRadius: element.borderRadius,
    paddingTop: safePadding.top,
    paddingRight: safePadding.right,
    paddingBottom: safePadding.bottom,
    paddingLeft: safePadding.left,
    width: element.width === "auto" ? "auto" : "100%",
    height: element.height === "auto" ? "auto" : "100%",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    minWidth: element.width === "auto" ? "fit-content" : 20,
    minHeight: element.height === "auto" ? "fit-content" : 20,
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
        position: "relative",
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : 20,
        minHeight: element.height === "auto" ? "fit-content" : 20,
      }}
      onClick={onSelect}
    >
      {isSelected ? (
        <input
          type="text"
          value={element.text}
          onChange={handleTextChange}
          className={cn(
            "text-center border-none outline-none",
            element.width === "auto" ? "w-auto" : "w-full",
            element.height === "auto" ? "h-auto" : "h-full"
          )}
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
      {childElements.map(renderChildElement)}
    </div>
  );
}
