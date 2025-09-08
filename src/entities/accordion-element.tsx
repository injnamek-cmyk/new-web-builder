"use client";

import React from "react";
import { AccordionElement } from "@/shared/types";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <Accordion
        type={element.accordionType || "single"}
        collapsible={element.collapsible}
        disabled={element.disabled}
        className={cn(
          "w-full",
          element.variant === "outline" && "border rounded-lg p-4",
          element.variant === "ghost" && "bg-transparent"
        )}
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
    </div>
  );
}
