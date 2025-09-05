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
  const { updateElement, getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  const handleItemChange = (
    itemId: string,
    field: "title" | "content",
    value: string
  ) => {
    updateElement(element.id, {
      items: element.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: "새 항목",
      content: "내용을 입력하세요",
    };
    updateElement(element.id, {
      items: [...element.items, newItem],
    });
  };

  const removeItem = (itemId: string) => {
    updateElement(element.id, {
      items: element.items.filter((item) => item.id !== itemId),
    });
  };

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
      {isSelected ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem();
              }}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              항목 추가
            </button>
          </div>
          <div className="space-y-2">
            {element.items.map((item) => (
              <div key={item.id} className="border rounded p-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(item.id, "title", e.target.value)
                    }
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    placeholder="제목"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
                <textarea
                  value={item.content}
                  onChange={(e) =>
                    handleItemChange(item.id, "content", e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm border rounded resize-none"
                  placeholder="내용"
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
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
      )}
      {childElements.map(renderChildElement)}
    </div>
  );
}
