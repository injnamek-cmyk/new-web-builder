"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Element } from "@/shared/types";

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
      {...listeners}
      {...attributes}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
