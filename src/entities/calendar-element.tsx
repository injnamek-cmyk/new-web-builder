"use client";

import React from "react";
import { CalendarElement } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

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
  const { updateElement } = useEditorStore();

  const handleDateSelect = (date: Date | undefined) => {
    updateElement(element.id, { selectedDate: date });
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
        position: "absolute",
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
          defaultMonth={element.defaultMonth}
          fixedWeeks={element.fixedWeeks}
          weekStartsOn={element.weekStartsOn}
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
          defaultMonth={element.defaultMonth}
          fixedWeeks={element.fixedWeeks}
          weekStartsOn={element.weekStartsOn}
          className="rounded-md border"
        />
      ) : (
        <Calendar
          mode="single"
          selected={element.selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays={element.showOutsideDays}
          disabled={element.disabled}
          defaultMonth={element.defaultMonth}
          fixedWeeks={element.fixedWeeks}
          weekStartsOn={element.weekStartsOn}
          className="rounded-md border"
        />
      )}
    </div>
  );
}
