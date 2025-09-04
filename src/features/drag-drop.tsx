"use client";

import React from "react";
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
    setGridConfig,
  } = useEditorStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = () => {
    setDragging(true);
    // 드래그 시작 시 그리드 표시
    setGridConfig({ showGrid: true });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (delta) {
      const element = canvas.elements.find((el) => el.id === active.id);

      if (element) {
        const newX = element.x + delta.x;
        const newY = element.y + delta.y;

        // 자식 요소인지 확인
        if (element.parentId) {
          // 자식 요소는 움직이지 못하도록 비활성화
          return;
        } else {
          // 최상위 요소는 그리드에 스냅
          const snappedPosition = snapToGrid(newX, newY);

          moveElement(element.id, snappedPosition.x, snappedPosition.y);
        }
      }
    }

    setDragging(false);
    // 드래그 종료 시 그리드 숨김 (사용자가 수동으로 켠 경우는 유지)
    // TODO: 사용자 설정에 따라 자동으로 그리드를 끄거나 켜는 로직 추가
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
