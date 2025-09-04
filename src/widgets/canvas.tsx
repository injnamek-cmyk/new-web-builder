"use client";

import React from "react";
import { useEditorStore } from "@/processes/editor-store";
import { Element } from "@/shared/types";
import DraggableElement from "@/features/draggable-element";
import TextElementComponent from "@/entities/text-element";
import ImageElementComponent from "@/entities/image-element";
import ButtonElementComponent from "@/entities/button-element";
import ContainerElementComponent from "@/entities/container-element";
import GridOverlay from "@/components/ui/grid-overlay";

export default function Canvas() {
  const { canvas, selectElement, grid } = useEditorStore();

  const renderElement = (element: Element) => {
    const isSelected = canvas.selectedElementId === element.id;
    const onSelect = (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      selectElement(element.id);
    };

    switch (element.type) {
      case "text":
        return (
          <DraggableElement key={element.id} element={element}>
            <TextElementComponent
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "image":
        return (
          <DraggableElement key={element.id} element={element}>
            <ImageElementComponent
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "button":
        return (
          <DraggableElement key={element.id} element={element}>
            <ButtonElementComponent
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          </DraggableElement>
        );
      case "container":
        return (
          <DraggableElement key={element.id} element={element}>
            <ContainerElementComponent
              element={element}
              isSelected={isSelected}
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
        onClick={() => selectElement(null)}
      >
        <GridOverlay
          grid={grid}
          canvasWidth={canvas.width}
          canvasHeight={canvas.height}
        />
        {canvas.elements.map(renderElement)}
      </div>
    </div>
  );
}
