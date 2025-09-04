"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/processes/editor-store";
import { Element } from "@/shared/types";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";
import GridOverlay from "@/components/ui/grid-overlay";

export default function Canvas() {
  const {
    canvas,
    selectElement,
    toggleSelection,
    clearSelection,
    isSelected,
    moveSelectedElements,
    deleteSelectedElements,
    grid,
  } = useEditorStore();

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete 키로 선택된 요소들 삭제
      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas.selectedElementIds.length > 0) {
          deleteSelectedElements();
        }
      }

      // 화살표 키로 선택된 요소들 이동
      if (canvas.selectedElementIds.length > 0) {
        const moveStep = e.shiftKey ? 10 : 1; // Shift 키와 함께 누르면 10px씩 이동

        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            moveSelectedElements(0, -moveStep);
            break;
          case "ArrowDown":
            e.preventDefault();
            moveSelectedElements(0, moveStep);
            break;
          case "ArrowLeft":
            e.preventDefault();
            moveSelectedElements(-moveStep, 0);
            break;
          case "ArrowRight":
            e.preventDefault();
            moveSelectedElements(moveStep, 0);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas.selectedElementIds, deleteSelectedElements, moveSelectedElements]);

  const renderElement = (element: Element) => {
    const isElementSelected = isSelected(element.id);
    const onSelect = (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지

      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd 클릭: 다중 선택 토글
        toggleSelection(element.id);
      } else {
        // 일반 클릭: 단일 선택
        selectElement(element.id);
      }
    };

    switch (element.type) {
      case "text":
        return (
          <DraggableElement
            key={`${element.id}-${element.parentId || "root"}`}
            element={element}
          >
            <TextElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "image":
        return (
          <DraggableElement
            key={`${element.id}-${element.parentId || "root"}`}
            element={element}
          >
            <ImageElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "button":
        return (
          <DraggableElement
            key={`${element.id}-${element.parentId || "root"}`}
            element={element}
          >
            <ButtonElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "container":
        return (
          <DraggableElement
            key={`${element.id}-${element.parentId || "root"}`}
            element={element}
          >
            <ContainerElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 relative overflow-auto">
      {/* 선택된 요소 정보 표시 */}
      {canvas.selectedElementIds.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium">
          <div className="font-bold">
            {canvas.selectedElementIds.length}개 요소 선택됨
          </div>
          <div className="text-xs mt-1 opacity-90">
            화살표 키: 이동 | Shift+화살표: 빠른 이동 | Delete: 삭제
          </div>
        </div>
      )}

      <div
        className="relative bg-white shadow-lg mx-auto my-8"
        style={{
          width: canvas.width,
          height: canvas.height,
          minWidth: canvas.width,
          minHeight: canvas.height,
          display: "block", // 항상 block으로 유지
          position: "relative", // 절대 위치 요소들의 기준점
        }}
        onClick={() => clearSelection()}
      >
        <GridOverlay
          grid={grid}
          canvasWidth={canvas.width}
          canvasHeight={canvas.height}
        />
        {canvas.elements
          .filter((element) => !element.parentId)
          .map(renderElement)}
      </div>
    </div>
  );
}
