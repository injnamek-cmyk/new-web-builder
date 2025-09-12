"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { RenderElement } from "@/shared/types/server-driven-ui";

// 하이브리드 렌더링 요소 타입 (기존 RenderElement를 확장)
interface HybridRenderElement extends RenderElement {
  layoutMode?: "absolute" | "flex" | "grid" | "flow";

  // 하이브리드 레이아웃용
  children?: string[];
  flexProps?: {
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    justifyContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "space-between"
      | "space-around"
      | "space-evenly";
    alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    gap?: number;
  };
  gridProps?: {
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gap?: number;
  };
  flowProps?: {
    display?: "block" | "inline" | "inline-block";
    margin?: number | string;
  };

  // 스타일 및 속성
  style: Record<string, string | number>;
  props: Record<string, string | number | boolean>;

  // 레이아웃 속성
  width?: number | "auto";
  height?: number | "auto";
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  // 컨테이너 속성
  backgroundColor?: string;
  borderRadius?: number;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  x?: number;
  y?: number;

  // 텍스트 속성
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: string | number;
  textDecoration?: string;
  lineHeight?: number;
  content?: string;

  // 이미지 속성
  src?: string;
  alt?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  filter?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    blur?: number;
  };

  // 버튼 속성
  variant?: string;
  text?: string;
  href?: string;
  icon?: string;
  iconPosition?: "left" | "right";

  // 아코디언 속성
  accordionType?: "single" | "multiple";
  collapsible?: boolean;
  disabled?: boolean;
  items?: { id: string; title: string; content: string }[];

  // 캘린더 속성
  mode?: "single" | "multiple" | "range";
  selectedDate?: Date;
  showOutsideDays?: boolean;
  defaultMonth?: Date;
  fixedWeeks?: boolean;
  weekStartsOn?: number;
}

interface HybridRendererProps {
  elements: HybridRenderElement[];
  canvasWidth: number;
  canvasHeight: number;
}

export function HybridRenderer({
  elements,
  canvasWidth,
  canvasHeight,
}: HybridRendererProps) {
  console.log("elements", elements);

  // 요소들을 ID로 매핑
  const elementMap = new Map<string, HybridRenderElement>();
  elements.forEach((element) => {
    elementMap.set(element.id, element);
  });

  // 최상위 요소들 찾기 (다른 요소의 children에 포함되지 않은 요소들)
  const topLevelElements = elements.filter((element) => {
    return !elements.some((parent) => parent.children?.includes(element.id));
  });

  return (
    <div
      className="relative"
      style={{
        width: canvasWidth,
        height: canvasHeight,
        background: "#ffffff",
      }}
    >
      {topLevelElements.map((element) => (
        <HybridElement
          key={element.id}
          element={element}
          elementMap={elementMap}
        />
      ))}
    </div>
  );
}

interface HybridElementProps {
  element: HybridRenderElement;
  elementMap: Map<string, HybridRenderElement>;
}

function HybridElement({ element, elementMap }: HybridElementProps) {
  // 자식 요소들 가져오기
  const childElements = (element.children || [])
    .map((childId) => elementMap.get(childId))
    .filter(Boolean) as HybridRenderElement[];

  // 레이아웃 모드별 스타일 적용
  const getLayoutStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      zIndex: element.zIndex,
      padding:
        element.padding &&
        typeof element.padding === "object" &&
        element.padding.top !== undefined
          ? `${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`
          : undefined,
    };

    switch (element.layoutMode || "absolute") {
      case "absolute":
        return {
          ...baseStyle,
          position: "absolute",
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
        };

      case "flex":
        return {
          ...baseStyle,
          display: "flex",
          flexDirection: element.flexProps?.flexDirection || "row",
          justifyContent: element.flexProps?.justifyContent || "flex-start",
          alignItems: element.flexProps?.alignItems || "stretch",
          gap: element.flexProps?.gap || 0,
          width: element.width !== "auto" ? element.width : undefined,
          height: element.height !== "auto" ? element.height : undefined,
        };

      case "grid":
        return {
          ...baseStyle,
          display: "grid",
          gridTemplateColumns: element.gridProps?.gridTemplateColumns || "1fr",
          gridTemplateRows: element.gridProps?.gridTemplateRows || "auto",
          gap: element.gridProps?.gap || 0,
          width: element.width !== "auto" ? element.width : undefined,
          height: element.height !== "auto" ? element.height : undefined,
        };

      case "flow":
        return {
          ...baseStyle,
          display: element.flowProps?.display || "block",
          margin: element.flowProps?.margin || 0,
          width: element.width !== "auto" ? element.width : undefined,
          height: element.height !== "auto" ? element.height : undefined,
        };

      default:
        return baseStyle;
    }
  };

  const layoutStyle = getLayoutStyle();

  // 컨테이너 타입의 경우 자식 요소들을 렌더링
  if (element.type === "container") {
    return (
      <div
        style={{
          ...layoutStyle,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius,
          borderStyle: element.borderStyle,
          borderWidth: element.borderWidth,
          borderColor: element.borderColor,
          boxShadow: getBoxShadow(element.boxShadow),
        }}
      >
        {childElements.map((child) => (
          <HybridElement
            key={child.id}
            element={child}
            elementMap={elementMap}
          />
        ))}
      </div>
    );
  }

  // 다른 요소 타입들은 기존 방식대로 렌더링
  const isAbsolute = (element.layoutMode || "absolute") === "absolute";
  return (
    <div style={isAbsolute ? layoutStyle : {}}>
      <div style={!isAbsolute ? layoutStyle : {}}>
        {renderElementContent(element)}
      </div>
    </div>
  );
}

function renderElementContent(element: HybridRenderElement) {
  switch (element.type) {
    case "text":
      return (
        <div
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
            textDecoration: element.textDecoration,
            lineHeight: element.lineHeight,
            display: "flex",
            alignItems: "center",
            justifyContent:
              element.textAlign === "center"
                ? "center"
                : element.textAlign === "right"
                ? "flex-end"
                : "flex-start",
            width: "100%",
            height: "100%",
          }}
        >
          {element.content}
        </div>
      );

    case "image":
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={element.src || ""}
            alt={element.alt || ""}
            fill
            style={{
              objectFit: element.objectFit,
              objectPosition: element.objectPosition,
              filter: element.filter
                ? `brightness(${element.filter.brightness || 1}) contrast(${
                    element.filter.contrast || 1
                  }) saturate(${element.filter.saturate || 1}) blur(${
                    element.filter.blur || 0
                  }px)`
                : undefined,
            }}
          />
        </div>
      );

    case "button":
      return (
        <Button
          variant={
            element.variant as
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
              | "ghost"
              | "link"
              | null
              | undefined
          }
          size="default"
          style={{
            width: "100%",
            height: "100%",
          }}
          onClick={() => {
            if (element.href) {
              window.open(element.href, "_blank");
            }
          }}
        >
          {element.icon && element.iconPosition === "left" && (
            <span className="mr-2">{element.icon}</span>
          )}
          {element.text}
          {element.icon && element.iconPosition === "right" && (
            <span className="ml-2">{element.icon}</span>
          )}
        </Button>
      );

    case "accordion":
      return (
        <Accordion
          type={element.accordionType || "single"}
          collapsible={element.collapsible}
          disabled={element.disabled}
          className="w-full h-full"
        >
          {element.items?.map(
            (
              item: { id: string; title: string; content: string },
              index: number
            ) => (
              <AccordionItem
                key={item.id || index}
                value={item.id || `item-${index}`}
              >
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      );

    case "calendar":
      return (
        <Calendar
          mode="single"
          selected={element.selectedDate}
          onSelect={() => {}} // 읽기 전용
          disabled={element.disabled}
          showOutsideDays={element.showOutsideDays}
          defaultMonth={element.defaultMonth}
          fixedWeeks={element.fixedWeeks}
          weekStartsOn={
            element.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
          }
          className="rounded-md border w-full h-full"
        />
      );

    default:
      console.warn(`Unknown element type: ${element.type}`);
      return (
        <div
          style={{
            border: "1px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            width: "100%",
            height: "100%",
          }}
        >
          Unknown element: {element.type}
        </div>
      );
  }
}

function getBoxShadow(shadowType?: string): string | undefined {
  switch (shadowType) {
    case "sm":
      return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    case "md":
      return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    case "lg":
      return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    case "xl":
      return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    case "2xl":
      return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    default:
      return undefined;
  }
}
