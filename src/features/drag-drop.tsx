"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Element } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";

interface DragDropProviderProps {
  children: React.ReactNode;
}

export default function DragDropProvider({ children }: DragDropProviderProps) {
  const { canvas, moveElement, setDragging } = useEditorStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (delta) {
      const element = canvas.elements.find((el) => el.id === active.id);
      if (element) {
        moveElement(element.id, element.x + delta.x, element.y + delta.y);
      }
    }

    setDragging(false);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        <div className="opacity-50">{/* 드래그 중인 요소의 미리보기 */}</div>
      </DragOverlay>
    </DndContext>
  );
}
