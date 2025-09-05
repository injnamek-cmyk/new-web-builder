"use client";

import React from "react";
import { AccordionElement, Element } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";

interface AccordionElementProps {
  element: AccordionElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function AccordionElementComponent({
  element,
  isSelected,
  onSelect,
}: AccordionElementProps) {
  const { getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  // 자식 요소 렌더링 함수
  const renderChildElement = (childElement: Element) => {
    const isChildSelected = false;
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

  // 실제 요소의 최종 크기 계산
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
      <Accordion
        type={element.collapsible ? "single" : "multiple"}
        collapsible={element.collapsible}
        className="w-full"
      >
        {element.items.map((item, index) => (
          <AccordionItem key={item.id} value={`item-${index}`}>
            <AccordionTrigger className="text-sm">
              {item.title || "제목 없음"}
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              {item.content || "내용 없음"}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {childElements.map(renderChildElement)}
    </div>
  );
}
