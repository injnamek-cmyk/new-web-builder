"use client";

import React, { useEffect, useState } from "react";
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
  const [isDisabled, setIsDisabled] = useState(!!element.parentId);

  console.log(`DraggableElement ${element.id}:`, {
    parentId: element.parentId,
    isDisabled,
    type: element.type,
  });

  // parentId가 변경될 때 isDisabled 상태 업데이트
  useEffect(() => {
    const newDisabled = !!element.parentId;
    console.log(`DraggableElement ${element.id} parentId 변경 감지:`, {
      이전: isDisabled,
      현재: newDisabled,
      parentId: element.parentId,
    });
    setIsDisabled(newDisabled);
  }, [element.parentId, isDisabled]);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: element.id,
      disabled: isDisabled, // 자식 요소는 드래그 비활성화
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
