"use client";

import React from "react";
import { TextElement, Element } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";
import DraggableElement from "@/features/draggable-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";

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
  const { updateElement, getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
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
        position: "relative",
        display: "inline-block",
        minWidth: element.width === "auto" ? "fit-content" : undefined,
        minHeight: element.height === "auto" ? "fit-content" : undefined,
      }}
      onClick={onSelect}
    >
      {isSelected ? (
        <textarea
          value={element.content}
          onChange={handleContentChange}
          className={cn(
            "resize-none border-none outline-none bg-transparent",
            element.width === "auto" ? "w-auto" : "w-full",
            element.height === "auto" ? "h-auto" : "h-full"
          )}
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
            minWidth: element.width === "auto" ? "fit-content" : undefined,
            minHeight: element.height === "auto" ? "fit-content" : undefined,
          }}
          autoFocus
        />
      ) : (
        <div
          className={cn(
            element.width === "auto" ? "w-auto" : "w-full",
            element.height === "auto" ? "h-auto" : "h-full"
          )}
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
            minWidth: element.width === "auto" ? "fit-content" : undefined,
            minHeight: element.height === "auto" ? "fit-content" : undefined,
          }}
        >
          {element.content || "텍스트를 입력하세요"}
        </div>
      )}
      {childElements.map(renderChildElement)}
    </div>
  );
}
