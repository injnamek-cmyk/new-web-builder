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
  const {
    canvas,
    moveElement,
    moveChildElement,
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

  const handleDragStart = (event: DragStartEvent) => {
    setDragging(true);
    // 드래그 시작 시 그리드 표시
    setGridConfig({ showGrid: true });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    console.log("=== 드래그 종료 ===");
    console.log("드래그된 요소 ID:", active.id);
    console.log("델타:", delta);

    if (delta) {
      const element = canvas.elements.find((el) => el.id === active.id);
      console.log("찾은 요소:", element);

      if (element) {
        const newX = element.x + delta.x;
        const newY = element.y + delta.y;

        console.log("새 위치:", { newX, newY });
        console.log("요소의 parentId:", element.parentId);

        // 자식 요소인지 확인
        if (element.parentId) {
          console.log("자식 요소이므로 드래그 비활성화");
          // 자식 요소는 움직이지 못하도록 비활성화
          return;
        } else {
          console.log("최상위 요소이므로 이동 처리");
          // 최상위 요소는 그리드에 스냅
          const snappedPosition = snapToGrid(newX, newY);
          console.log("스냅된 위치:", snappedPosition);
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
