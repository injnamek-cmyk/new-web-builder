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
interface HybridRenderElement extends Omit<RenderElement, 'size'> {
  layoutMode?: "flex" | "grid" | "flow";
  positionMode?: "absolute" | "relative" | "static";

  // 하이브리드 레이아웃용
  children?: string[];
  gap?: number; // 전역 gap 속성
  flex?: {
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

  // 스타일 및 속성 (옵션널로 변경)
  style?: Record<string, string | number>;
  props?: Record<string, string | number | boolean>;

  // 레이아웃 속성 (size 속성 재정의)
  size?: string; // 버튼용 size 속성
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

  // 도형 속성
  shapeType?: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "heart";
  background?: {
    type: "color" | "image";
    color?: string;
    imageUrl?: string;
    imageSize?: "cover" | "contain" | "stretch" | "repeat";
    imagePosition?: string;
  };
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number;
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
          isTopLevel={true}
        />
      ))}
    </div>
  );
}

interface HybridElementProps {
  element: HybridRenderElement;
  elementMap: Map<string, HybridRenderElement>;
}

function HybridElement({
  element,
  elementMap,
  isTopLevel = false,
}: HybridElementProps & { isTopLevel?: boolean }) {
  // 자식 요소들 가져오기
  const childElements = (element.children || [])
    .map((childId) => elementMap.get(childId))
    .filter(Boolean) as HybridRenderElement[];

  // 포지션과 레이아웃 스타일 적용
  const getElementStyle = (
    isTopLevel: boolean = false
  ): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      zIndex: element.zIndex,
      padding:
        element.padding &&
        typeof element.padding === "object" &&
        element.padding.top !== undefined
          ? `${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`
          : undefined,
    };

    // 포지션 스타일 결정
    const positionStyle: React.CSSProperties = {};
    const positionMode = isTopLevel
      ? "absolute"
      : element.positionMode || "static";

    switch (positionMode) {
      case "absolute":
        positionStyle.position = "absolute";
        positionStyle.left = element.x;
        positionStyle.top = element.y;
        break;
      case "relative":
        positionStyle.position = "relative";
        if (element.x !== undefined) positionStyle.left = element.x;
        if (element.y !== undefined) positionStyle.top = element.y;
        break;
      case "static":
      default:
        // static은 기본값이므로 별도 설정 불필요
        break;
    }

    // 레이아웃 모드 스타일 결정 (자식 배치 방식)
    const layoutStyle: React.CSSProperties = {};
    switch (element.layoutMode) {
      case "flex":
        layoutStyle.display = "flex";
        layoutStyle.flexDirection = element.flex?.flexDirection || "row";
        layoutStyle.justifyContent =
          element.flex?.justifyContent || "flex-start";
        layoutStyle.alignItems = element.flex?.alignItems || "stretch";
        layoutStyle.gap = element.flex?.gap || 0;
        break;
      case "grid":
        layoutStyle.display = "grid";
        layoutStyle.gridTemplateColumns =
          element.gridProps?.gridTemplateColumns || "1fr";
        layoutStyle.gridTemplateRows =
          element.gridProps?.gridTemplateRows || "auto";
        layoutStyle.gap = element.gridProps?.gap || 0;
        break;
      case "flow":
        layoutStyle.display = element.flowProps?.display || "block";
        if (element.flowProps?.margin !== undefined) {
          layoutStyle.margin = element.flowProps.margin;
        }
        break;
      default:
        // 기본은 block 레이아웃
        layoutStyle.display = "block";
        break;
    }

    // 크기 스타일
    const sizeStyle: React.CSSProperties = {};
    if (element.width !== undefined && element.width !== "auto") {
      sizeStyle.width = element.width;
    }
    if (element.height !== undefined && element.height !== "auto") {
      sizeStyle.height = element.height;
    }

    return {
      ...baseStyle,
      ...positionStyle,
      ...layoutStyle,
      ...sizeStyle,
    };
  };

  const elementStyle = getElementStyle(isTopLevel);

  // 컨테이너 타입의 경우 자식 요소들을 렌더링
  if (element.type === "container") {
    // 컨테이너용 레이아웃 스타일 다시 계산 (gap 포함)
    const containerLayoutStyle: React.CSSProperties = {};
    switch (element.layoutMode) {
      case "flex":
        containerLayoutStyle.display = "flex";
        containerLayoutStyle.flexDirection = element.flex?.flexDirection || "row";
        containerLayoutStyle.justifyContent = element.flex?.justifyContent || "flex-start";
        containerLayoutStyle.alignItems = element.flex?.alignItems || "stretch";
        containerLayoutStyle.gap = element.gap ?? element.flex?.gap ?? 0;
        break;
      case "grid":
        containerLayoutStyle.display = "grid";
        containerLayoutStyle.gridTemplateColumns = element.gridProps?.gridTemplateColumns || "1fr";
        containerLayoutStyle.gridTemplateRows = element.gridProps?.gridTemplateRows || "auto";
        containerLayoutStyle.gap = element.gap ?? element.gridProps?.gap ?? 0;
        break;
      case "flow":
        containerLayoutStyle.display = element.flowProps?.display || "block";
        if (element.flowProps?.margin !== undefined) {
          containerLayoutStyle.margin = element.flowProps.margin;
        }
        break;
      default:
        containerLayoutStyle.display = "block";
        break;
    }

    return (
      <div
        style={{
          ...elementStyle,
          ...containerLayoutStyle,
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
  return <div style={elementStyle}>{renderElementContent(element)}</div>;
}

function renderElementContent(element: HybridRenderElement) {
  switch (element.type) {
    case "text":
      return (
        <div
          style={{
            // HybridRenderElement의 텍스트 스타일 속성들 적용
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontWeight: element.fontWeight,
            textDecoration: element.textDecoration,
            lineHeight: element.lineHeight,
            // 추가 스타일 객체가 있다면 적용 (덮어쓸 수 있음)
            ...element.style,
            // 레이아웃 기본값
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
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            // 사용자 정의 컨테이너 스타일 적용
            ...element.style,
          }}
        >
          <Image
            src={element.src || ""}
            alt={element.alt || ""}
            fill
            style={{
              objectFit: element.objectFit || "fill",
              objectPosition: element.objectPosition || "center",
              filter: element.filter
                ? `brightness(${element.filter.brightness ?? 100}%) contrast(${
                    element.filter.contrast ?? 100
                  }%) saturate(${element.filter.saturate ?? 100}%) blur(${
                    element.filter.blur ?? 0
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
            (element.variant as
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
              | "ghost"
              | "link") || "default"
          }
          size={
            (element.size as
              | "default"
              | "sm"
              | "lg"
              | "icon") || "default"
          }
          style={{
            ...element.style,
          }}
          onClick={() => {
            if (element.href) {
              window.open(element.href, "_blank");
            }
          }}
        >
          {element.icon !== "none" && element.iconPosition === "left" && (
            <span className="mr-2">{element.icon}</span>
          )}
          {element.text}
          {element.icon !== "none" && element.iconPosition === "right" && (
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

    case "shape":
      if (element.shapeType === "triangle") {
        return renderTriangleSVG(element);
      }
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            ...getShapeStyles(element),
            ...element.style,
          }}
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

function renderTriangleSVG(element: HybridRenderElement) {
  const width = element.width || 100;
  const height = element.height || 100;
  const patternId = `triangle-pattern-${Math.random().toString(36).substr(2, 9)}`;

  // 배경색 결정
  const actualBackgroundColor = element.background?.type === "color"
    ? element.background.color
    : element.backgroundColor || "#3b82f6";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: element.borderRadius && element.borderRadius > 0 ? `${element.borderRadius}px` : 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", overflow: "visible" }}
      >
        {element.background?.type === "image" && element.background.imageUrl && (
          <defs>
            <pattern
              id={patternId}
              patternUnits="objectBoundingBox"
              width="100%"
              height="100%"
            >
              <image
                href={element.background.imageUrl}
                width={width}
                height={height}
                preserveAspectRatio={
                  element.background.imageSize === "cover" ? "xMidYMid slice" :
                  element.background.imageSize === "contain" ? "xMidYMid meet" :
                  "none"
                }
              />
            </pattern>
          </defs>
        )}
        <polygon
          points={`${width/2},10 10,${height-10} ${width-10},${height-10}`}
          fill={
            element.background?.type === "image" && element.background.imageUrl
              ? `url(#${patternId})`
              : actualBackgroundColor
          }
          stroke={element.borderStyle !== "none" ? element.borderColor : "none"}
          strokeWidth={element.borderWidth || 0}
        />
      </svg>
    </div>
  );
}

function getShapeStyles(element: HybridRenderElement): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    border: `${element.borderWidth || 0}px ${element.borderStyle || "solid"} ${element.borderColor || "transparent"}`,
  };

  // 배경 스타일 설정
  if (element.background) {
    if (element.background.type === "color") {
      baseStyle.backgroundColor = element.background.color;
    } else if (element.background.type === "image" && element.background.imageUrl) {
      baseStyle.backgroundImage = `url(${element.background.imageUrl})`;
      baseStyle.backgroundPosition = element.background.imagePosition || "center";

      switch (element.background.imageSize) {
        case "cover":
          baseStyle.backgroundSize = "cover";
          break;
        case "contain":
          baseStyle.backgroundSize = "contain";
          break;
        case "stretch":
          baseStyle.backgroundSize = "100% 100%";
          break;
        case "repeat":
          baseStyle.backgroundRepeat = "repeat";
          break;
        default:
          baseStyle.backgroundSize = "cover";
      }

      if (element.background.imageSize !== "repeat") {
        baseStyle.backgroundRepeat = "no-repeat";
      }
    }
  }

  // 도형별 스타일 적용
  switch (element.shapeType) {
    case "circle":
      baseStyle.borderRadius = "50%";
      break;
    case "rectangle":
      baseStyle.borderRadius = element.borderRadius ? `${element.borderRadius}px` : "0px";
      break;
    case "triangle":
      // SVG로 렌더링하므로 특별한 스타일 불필요
      break;
    case "diamond":
      baseStyle.transform = "rotate(45deg)";
      break;
    case "star":
      baseStyle.clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      break;
    case "heart":
      baseStyle.position = "relative";
      baseStyle.width = "100px";
      baseStyle.height = "90px";
      baseStyle.transform = "rotate(-45deg)";
      baseStyle.borderRadius = "50px 50px 0 0";
      baseStyle.setProperty?.("--heart-before", `
        content: '';
        width: 52px;
        height: 80px;
        position: absolute;
        left: 50px;
        top: 0;
        background: ${element.background?.color || element.borderColor || "#000"};
        border-radius: 50px 50px 0 0;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      `);
      baseStyle.setProperty?.("--heart-after", `
        content: '';
        width: 52px;
        height: 80px;
        position: absolute;
        left: 0;
        top: -25px;
        background: ${element.background?.color || element.borderColor || "#000"};
        border-radius: 50px 50px 0 0;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      `);
      break;
    default:
      break;
  }

  return baseStyle;
}
