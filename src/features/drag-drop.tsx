"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEditorStore } from "@/processes/editor-store";

interface DragDropProviderProps {
  children: React.ReactNode;
}

export default function DragDropProvider({ children }: DragDropProviderProps) {
  const {
    canvas,
    moveElement,
    setDragging,
    snapToGrid,
    canvasZoom,
    grid,
    setGridConfig,
  } = useEditorStore();

  // 드래그 시작 전 그리드 상태를 저장
  const [originalGridState, setOriginalGridState] = useState<boolean | null>(
    null
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = () => {
    setDragging(true);
    // 드래그 시작 전 그리드 상태 저장
    setOriginalGridState(grid.showGrid);
    // 그리드가 숨겨진 상태에서만 드래그 시 그리드 표시
    if (!grid.showGrid) {
      setGridConfig({ showGrid: true });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (delta) {
      const element = canvas.elements.find((el) => el.id === active.id);

      if (element) {
        // 스케일 팩터를 고려하여 델타 값을 조정
        const scaledDeltaX = delta.x / canvasZoom;
        const scaledDeltaY = delta.y / canvasZoom;

        const newX = element.x + scaledDeltaX;
        const newY = element.y + scaledDeltaY;

        // 그리드에 스냅
        const snappedPosition = snapToGrid(newX, newY);
        moveElement(element.id, snappedPosition.x, snappedPosition.y);
      }
    }

    setDragging(false);

    // 원래 그리드 상태로 복원 (원래 숨겨져 있었다면 다시 숨김)
    if (originalGridState === false) {
      setGridConfig({ showGrid: false });
    }
    setOriginalGridState(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
