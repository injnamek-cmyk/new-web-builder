"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shapes, ChevronDown, Square, Circle, Triangle } from "lucide-react";

interface ShapeDropdownProps {
  onShapeSelect: (shapeType: "rectangle" | "circle" | "triangle") => void;
}

export default function ShapeDropdown({ onShapeSelect }: ShapeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shapeOptions = [
    {
      type: "rectangle" as const,
      label: "사각형",
      icon: Square,
      color: "#3b82f6", // 파란색
    },
    {
      type: "circle" as const,
      label: "원",
      icon: Circle,
      color: "#ef4444", // 빨간색
    },
    {
      type: "triangle" as const,
      label: "삼각형",
      icon: Triangle,
      color: "#10b981", // 초록색
    },
  ];

  const handleShapeSelect = (shapeType: "rectangle" | "circle" | "triangle") => {
    onShapeSelect(shapeType);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Shapes className="w-4 h-4" />
          도형
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-32">
        {shapeOptions.map((shape) => {
          const IconComponent = shape.icon;
          return (
            <DropdownMenuItem
              key={shape.type}
              onClick={() => handleShapeSelect(shape.type)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconComponent
                className="w-4 h-4"
                style={{ color: shape.color }}
              />
              {shape.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}