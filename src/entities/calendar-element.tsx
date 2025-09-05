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
      {element.mode === "range" ? (
        <Calendar
          mode="range"
          selected={
            element.selectedDates
              ? { from: element.selectedDates[0], to: element.selectedDates[1] }
              : undefined
          }
          onSelect={(range) => {
            if (range?.from && range?.to) {
              updateElement(element.id, {
                selectedDates: [range.from, range.to],
              });
            }
          }}
          showOutsideDays={element.showOutsideDays}
          disabled={element.disabled}
          className="rounded-md border"
        />
      ) : element.mode === "multiple" ? (
        <Calendar
          mode="multiple"
          selected={element.selectedDates}
          onSelect={(dates) =>
            updateElement(element.id, { selectedDates: dates })
          }
          showOutsideDays={element.showOutsideDays}
          disabled={element.disabled}
          className="rounded-md border"
        />
      ) : (
        <Calendar
          mode="single"
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
