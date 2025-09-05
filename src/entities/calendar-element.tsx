"use client";

import React from "react";
import { CalendarElement, Element } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";
import AccordionElementComponent from "@/entities/accordion-element";

interface CalendarElementProps {
  element: CalendarElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export default function CalendarElementComponent({
  element,
  isSelected,
  onSelect,
}: CalendarElementProps) {
  const { updateElement, getChildElements, selectElement } = useEditorStore();

  // 자식 요소들 가져오기
  const childElements = getChildElements(element.id);

  const handleDateSelect = (date: Date | undefined) => {
    updateElement(element.id, { selectedDate: date });
  };

  const handleDatesSelect = (dates: Date[] | undefined) => {
    updateElement(element.id, { selectedDates: dates });
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
      case "accordion":
        return (
          <DraggableElement key={childElement.id} element={childElement}>
            <AccordionElementComponent
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
          <div className="text-sm text-gray-600">캘린더 설정</div>
          <div className="space-y-2">
            <div>
              <label className="text-xs">모드:</label>
              <select
                value={element.mode || "single"}
                onChange={(e) =>
                  updateElement(element.id, { mode: e.target.value as any })
                }
                className="w-full px-2 py-1 text-sm border rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="single">단일 선택</option>
                <option value="range">범위 선택</option>
                <option value="multiple">다중 선택</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOutsideDays"
                checked={element.showOutsideDays || false}
                onChange={(e) =>
                  updateElement(element.id, {
                    showOutsideDays: e.target.checked,
                  })
                }
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="showOutsideDays" className="text-xs">
                외부 날짜 표시
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="disabled"
                checked={element.disabled || false}
                onChange={(e) =>
                  updateElement(element.id, { disabled: e.target.checked })
                }
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="disabled" className="text-xs">
                비활성화
              </label>
            </div>
          </div>
        </div>
      ) : (
        <Calendar
          mode={element.mode || "single"}
          selected={element.selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays={element.showOutsideDays}
          disabled={element.disabled}
          className="rounded-md border"
        />
      )}
      {childElements.map(renderChildElement)}
    </div>
  );
}
