"use client";

import React from "react";
import { ContainerElement, Element } from "@/shared/types";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/processes/editor-store";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";

interface ContainerElementProps {
  element: ContainerElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function ContainerElementComponent({
  element,
  isSelected,
  onSelect,
}: ContainerElementProps) {
  const { getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const actualWidth =
    element.width + element.padding.left + element.padding.right;
  const actualHeight =
    element.height + element.padding.top + element.padding.bottom;

  const containerStyle = {
    backgroundColor:
      element.backgroundColor === "transparent"
        ? "transparent"
        : element.backgroundColor,
    borderRadius: element.borderRadius,
    paddingTop: element.padding.top,
    paddingRight: element.padding.right,
    paddingBottom: element.padding.bottom,
    paddingLeft: element.padding.left,
    width: "100%",
    height: "100%",
    position: "relative" as const,
    border:
      element.backgroundColor === "transparent" ? "none" : "1px solid #d1d5db",
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
      default:
        return null;
    }
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
      }}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {childElements.length === 0 &&
          element.backgroundColor !== "transparent" && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              컨테이너
            </div>
          )}
        {childElements.map(renderChildElement)}
      </div>
    </div>
  );
}
