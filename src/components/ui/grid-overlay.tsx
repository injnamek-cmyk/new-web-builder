"use client";

import React from "react";
import { GridConfig } from "@/shared/types";

interface GridOverlayProps {
  grid: GridConfig;
  canvasWidth: number;
  canvasHeight: number;
  isDragging?: boolean;
}

export default function GridOverlay({
  grid,
  canvasWidth,
  canvasHeight,
  isDragging = false,
}: GridOverlayProps) {
  // 그리드가 켜져있고 드래그 중일 때만 표시
  if (!grid.showGrid || !isDragging) return null;

  const { cellSize } = grid;

  // 그리드 라인을 그리는 SVG 패턴 생성
  const gridPattern = `
    <defs>
      <pattern id="grid" width="${cellSize}" height="${cellSize}" patternUnits="userSpaceOnUse">
        <path d="M ${cellSize} 0 L 0 0 0 ${cellSize}" fill="none" stroke="#e5e7eb" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  `;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: gridPattern }}
      />
    </div>
  );
}
