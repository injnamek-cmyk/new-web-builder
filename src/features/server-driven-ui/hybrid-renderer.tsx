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

// 하이브리드 렌더링 요소 타입
interface HybridRenderElement {
  id: string;
  type: string;
  layoutMode: 'absolute' | 'flex' | 'grid' | 'flow';
  
  // 절대 포지셔닝용 (기존 호환성)
  position: { x: number; y: number };
  size: { width: number | "auto"; height: number | "auto" };
  zIndex: number;
  
  // 하이브리드 레이아웃용
  children: string[];
  flexProps?: any;
  gridProps?: any;
  flowProps?: any;
  
  style: Record<string, any>;
  props: Record<string, any>;
}

interface HybridRendererProps {
  elements: HybridRenderElement[];
  canvasWidth: number;
  canvasHeight: number;
}

export function HybridRenderer({ 
  elements, 
  canvasWidth, 
  canvasHeight 
}: HybridRendererProps) {
  // 요소들을 ID로 매핑
  const elementMap = new Map<string, HybridRenderElement>();
  elements.forEach(element => {
    elementMap.set(element.id, element);
  });

  // 최상위 요소들 찾기 (다른 요소의 children에 포함되지 않은 요소들)
  const topLevelElements = elements.filter(element => {
    return !elements.some(parent => parent.children.includes(element.id));
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
  const childElements = element.children
    .map(childId => elementMap.get(childId))
    .filter(Boolean) as HybridRenderElement[];

  // 레이아웃 모드별 스타일 적용
  const getLayoutStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      zIndex: element.zIndex,
      padding: element.style.padding ? 
        `${element.style.padding.top}px ${element.style.padding.right}px ${element.style.padding.bottom}px ${element.style.padding.left}px` : 
        undefined,
    };

    switch (element.layoutMode) {
      case 'absolute':
        return {
          ...baseStyle,
          position: "absolute",
          left: element.position.x,
          top: element.position.y,
          width: element.size.width,
          height: element.size.height,
        };

      case 'flex':
        return {
          ...baseStyle,
          display: "flex",
          flexDirection: element.flexProps?.flexDirection || "row",
          justifyContent: element.flexProps?.justifyContent || "flex-start",
          alignItems: element.flexProps?.alignItems || "stretch",
          gap: element.flexProps?.gap || 0,
          width: element.size.width !== "auto" ? element.size.width : undefined,
          height: element.size.height !== "auto" ? element.size.height : undefined,
        };

      case 'grid':
        return {
          ...baseStyle,
          display: "grid",
          gridTemplateColumns: element.gridProps?.gridTemplateColumns || "1fr",
          gridTemplateRows: element.gridProps?.gridTemplateRows || "auto",
          gap: element.gridProps?.gap || 0,
          width: element.size.width !== "auto" ? element.size.width : undefined,
          height: element.size.height !== "auto" ? element.size.height : undefined,
        };

      case 'flow':
        return {
          ...baseStyle,
          display: element.flowProps?.display || "block",
          margin: element.flowProps?.margin || 0,
          width: element.size.width !== "auto" ? element.size.width : undefined,
          height: element.size.height !== "auto" ? element.size.height : undefined,
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
          backgroundColor: element.style.backgroundColor,
          borderRadius: element.style.borderRadius,
          borderStyle: element.style.borderStyle,
          borderWidth: element.style.borderWidth,
          borderColor: element.style.borderColor,
          boxShadow: getBoxShadow(element.style.boxShadow),
        }}
      >
        {childElements.map(child => (
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
  return (
    <div style={element.layoutMode === 'absolute' ? layoutStyle : {}}>
      <div style={element.layoutMode !== 'absolute' ? layoutStyle : {}}>
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
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            color: element.style.color,
            textAlign: element.style.textAlign,
            fontWeight: element.style.fontWeight,
            textDecoration: element.style.textDecoration,
            lineHeight: element.style.lineHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: element.style.textAlign === "center" ? "center" : 
                           element.style.textAlign === "right" ? "flex-end" : 
                           "flex-start",
            width: "100%",
            height: "100%",
          }}
        >
          {element.props.content}
        </div>
      );

    case "image":
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={element.props.src}
            alt={element.props.alt}
            fill
            style={{
              objectFit: element.style.objectFit,
              objectPosition: element.style.objectPosition,
              filter: element.style.filter ? 
                `brightness(${element.style.filter.brightness}) contrast(${element.style.filter.contrast}) saturate(${element.style.filter.saturate}) blur(${element.style.filter.blur}px)` : 
                undefined,
            }}
          />
        </div>
      );

    case "button":
      return (
        <Button
          variant={element.props.variant}
          size={element.props.size}
          style={{
            backgroundColor: element.style.backgroundColor,
            color: element.style.textColor,
            borderRadius: element.style.borderRadius,
            width: "100%",
            height: "100%",
          }}
          onClick={() => {
            if (element.props.href) {
              window.open(element.props.href, "_blank");
            }
          }}
        >
          {element.props.icon && element.props.iconPosition === "left" && (
            <span className="mr-2">{element.props.icon}</span>
          )}
          {element.props.text}
          {element.props.icon && element.props.iconPosition === "right" && (
            <span className="ml-2">{element.props.icon}</span>
          )}
        </Button>
      );

    case "accordion":
      return (
        <Accordion
          type={element.props.accordionType || "single"}
          collapsible={element.props.collapsible}
          disabled={element.props.disabled}
          className="w-full h-full"
        >
          {element.props.items?.map((item: { id: string; title: string; content: string }, index: number) => (
            <AccordionItem key={item.id || index} value={item.id || `item-${index}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

    case "calendar":
      return (
        <Calendar
          mode={element.props.mode}
          selected={element.props.selectedDate}
          onSelect={() => {}} // 읽기 전용
          disabled={element.props.disabled}
          showOutsideDays={element.props.showOutsideDays}
          defaultMonth={element.props.defaultMonth}
          fixedWeeks={element.props.fixedWeeks}
          weekStartsOn={element.props.weekStartsOn}
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
    case "sm": return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    case "md": return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    case "lg": return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    case "xl": return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    case "2xl": return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    default: return undefined;
  }
}