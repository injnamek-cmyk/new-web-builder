"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/processes/editor-store";
import { Element } from "@/shared/types";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";
import AccordionElementComponent from "@/entities/accordion-element";
import CalendarElementComponent from "@/entities/calendar-element";
import ShapeElementComponent from "@/entities/shape-element";
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
    toggleGrid,
    isDragging,
    canvasZoom,
    setCanvasZoom,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // 스크롤 줌 핸들러
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Ctrl/Cmd 키와 함께 휠을 돌릴 때만 줌
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      // 줌 방향 결정 (휠 위로 = 줌인, 아래로 = 줌아웃)
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, canvasZoom * zoomFactor));

      setCanvasZoom(newZoom);
    },
    [canvasZoom, setCanvasZoom]
  );

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에 포커스가 있지 않을 때만 실행
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.contentEditable === "true";

      if (isInputFocused) {
        return; // 입력 필드에 포커스가 있으면 키보드 이벤트 무시
      }

      // G 키 또는 Cmd+G로 그리드 토글
      if (e.key === "g" || e.key === "G" || (e.metaKey && e.key === "g")) {
        e.preventDefault();
        toggleGrid();
        return;
      }

      // Delete 키로 선택된 요소들 삭제 (백스페이스 키는 제외)
      if (e.key === "Delete") {
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
  }, [deleteSelectedElements, moveSelectedElements, toggleGrid]);

  // 스크롤 줌 이벤트 리스너
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvasElement.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

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
          <DraggableElement key={element.id} element={element}>
            <TextElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "image":
        return (
          <DraggableElement key={element.id} element={element}>
            <ImageElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "button":
        return (
          <DraggableElement key={element.id} element={element}>
            <ButtonElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "container":
        return (
          <DraggableElement key={element.id} element={element}>
            <ContainerElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "accordion":
        return (
          <DraggableElement key={element.id} element={element}>
            <AccordionElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "calendar":
        return (
          <DraggableElement key={element.id} element={element}>
            <CalendarElementComponent
              element={element}
              isSelected={isElementSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "shape":
        return (
          <DraggableElement key={element.id} element={element}>
            <ShapeElementComponent
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

  console.log("canvas", canvas);

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-gray-50 relative overflow-auto hide-scrollbar"
    >
      {/* 선택된 요소 정보 표시 */}
      {canvas && canvas.selectedElementIds.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-semibold">
              {canvas.selectedElementIds.length}개 요소 선택됨
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 hidden lg:block">
            화살표 키: 이동 | Shift+화살표: 빠른 이동 | Delete 키: 삭제
          </div>
        </div>
      )}

      <div
        className="relative bg-white shadow-lg mx-auto my-2 lg:my-8"
        style={{
          width: canvas?.width * canvasZoom,
          height: canvas?.height * canvasZoom,
          minWidth: canvas?.width * canvasZoom,
          minHeight: canvas?.height * canvasZoom,
          display: "block", // 항상 block으로 유지
          position: "relative", // 절대 위치 요소들의 기준점
          marginLeft: "max(20px, calc(50vw - 50%))", // 좌측 패딩
          marginRight: "max(20px, calc(50vw - 50%))", // 우측 패딩
        }}
        onClick={() => clearSelection()}
      >
        <div
          style={{
            transform: `scale(${canvasZoom})`,
            transformOrigin: "top left",
            width: canvas?.width,
            height: canvas?.height,
          }}
        >
          <GridOverlay
            grid={grid}
            canvasWidth={canvas?.width}
            canvasHeight={canvas?.height}
            isDragging={isDragging}
          />
          {canvas?.elements
            .filter((element) => {
              // 다른 컨테이너의 자식인 요소는 캔버스에서 직접 렌더링하지 않음
              const isChildOfContainer = canvas?.elements.some((containerElement) => 
                containerElement.type === "container" && 
                (containerElement as any).children?.includes(element.id)
              );
              return !isChildOfContainer;
            })
            .map(renderElement)}
        </div>
      </div>
    </div>
  );
}
