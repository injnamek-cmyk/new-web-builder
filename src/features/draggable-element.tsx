"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Element } from "@/shared/types";
import { cn } from "@/lib/utils";

interface DraggableElementProps {
  element: Element;
  children: React.ReactNode;
}

export default function DraggableElement({
  element,
  children,
}: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: element.id,
      disabled: !!element.parentId, // 자식 요소는 드래그 비활성화
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(element.parentId ? {} : listeners)} // 자식 요소는 listeners 비활성화
      {...attributes}
      className={cn(isDragging && "opacity-50 z-9999")}
    >
      {children}
    </div>
  );
}
