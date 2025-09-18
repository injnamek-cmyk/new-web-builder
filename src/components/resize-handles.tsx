"use client";

import React, { useCallback, useRef } from "react";
import { useEditorStore } from "@/processes/editor-store";

interface ResizeHandlesProps {
  elementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export default function ResizeHandles({
  elementId,
  x,
  y,
  width,
  height,
  zoom,
}: ResizeHandlesProps) {
  const { resizeAndMoveElement, setResizing } = useEditorStore();
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startElementPos = useRef({ x: 0, y: 0 });
  const resizeType = useRef<string>("");

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: string) => {
      e.stopPropagation();
      e.preventDefault();

      isDragging.current = true;
      resizeType.current = type;
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { width, height };
      startElementPos.current = { x, y };

      setResizing(true);

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;

        const deltaX = (e.clientX - startPos.current.x) / zoom;
        const deltaY = (e.clientY - startPos.current.y) / zoom;

        let newWidth = startSize.current.width;
        let newHeight = startSize.current.height;
        let newX = startElementPos.current.x;
        let newY = startElementPos.current.y;

        switch (resizeType.current) {
          case "se": // 남동쪽 (오른쪽 아래) - 위치 고정, 크기만 변경
            newWidth = Math.max(10, startSize.current.width + deltaX);
            newHeight = Math.max(10, startSize.current.height + deltaY);
            break;
          case "sw": // 남서쪽 (왼쪽 아래) - X 위치 변경, 높이 증가
            newWidth = Math.max(10, startSize.current.width - deltaX);
            newHeight = Math.max(10, startSize.current.height + deltaY);
            newX =
              startElementPos.current.x + (startSize.current.width - newWidth);
            break;
          case "ne": // 북동쪽 (오른쪽 위) - Y 위치 변경, 폭 증가
            newWidth = Math.max(10, startSize.current.width + deltaX);
            newHeight = Math.max(10, startSize.current.height - deltaY);
            newY =
              startElementPos.current.y +
              (startSize.current.height - newHeight);
            break;
          case "nw": // 북서쪽 (왼쪽 위) - X, Y 위치 모두 변경
            newWidth = Math.max(10, startSize.current.width - deltaX);
            newHeight = Math.max(10, startSize.current.height - deltaY);
            newX =
              startElementPos.current.x + (startSize.current.width - newWidth);
            newY =
              startElementPos.current.y +
              (startSize.current.height - newHeight);
            break;
          case "n": // 북쪽 (위) - Y 위치 변경, 높이 변경
            newHeight = Math.max(10, startSize.current.height - deltaY);
            newY =
              startElementPos.current.y +
              (startSize.current.height - newHeight);
            break;
          case "s": // 남쪽 (아래) - 위치 고정, 높이만 변경
            newHeight = Math.max(10, startSize.current.height + deltaY);
            break;
          case "e": // 동쪽 (오른쪽) - 위치 고정, 폭만 변경
            newWidth = Math.max(10, startSize.current.width + deltaX);
            break;
          case "w": // 서쪽 (왼쪽) - X 위치 변경, 폭 변경
            newWidth = Math.max(10, startSize.current.width - deltaX);
            newX =
              startElementPos.current.x + (startSize.current.width - newWidth);
            break;
        }

        resizeAndMoveElement(elementId, newX, newY, newWidth, newHeight);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        setResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [elementId, x, y, width, height, zoom, resizeAndMoveElement, setResizing]
  );

  const handleSize = 8;
  const handleSizeZoomed = handleSize / zoom;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
    >
      {/* 모서리 핸들 */}
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-nw-resize pointer-events-auto"
        style={{
          left: -handleSizeZoomed / 2,
          top: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "nw")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-ne-resize pointer-events-auto"
        style={{
          right: -handleSizeZoomed / 2,
          top: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "ne")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-sw-resize pointer-events-auto"
        style={{
          left: -handleSizeZoomed / 2,
          bottom: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "sw")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-se-resize pointer-events-auto"
        style={{
          right: -handleSizeZoomed / 2,
          bottom: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "se")}
      />

      {/* 변 중앙 핸들 */}
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-n-resize pointer-events-auto"
        style={{
          left: width / 2 - handleSizeZoomed / 2,
          top: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "n")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-s-resize pointer-events-auto"
        style={{
          left: width / 2 - handleSizeZoomed / 2,
          bottom: -handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "s")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-w-resize pointer-events-auto"
        style={{
          left: -handleSizeZoomed / 2,
          top: height / 2 - handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "w")}
      />
      <div
        className="absolute bg-blue-500 border border-white shadow-sm cursor-e-resize pointer-events-auto"
        style={{
          right: -handleSizeZoomed / 2,
          top: height / 2 - handleSizeZoomed / 2,
          width: handleSizeZoomed,
          height: handleSizeZoomed,
        }}
        onMouseDown={(e) => handleMouseDown(e, "e")}
      />
    </div>
  );
}
