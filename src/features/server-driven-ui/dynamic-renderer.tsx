"use client";

import React from "react";
import Image from "next/image";
import { RenderElement } from "@/shared/types/server-driven-ui";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DynamicRendererProps {
  elements: RenderElement[];
  canvasWidth: number;
  canvasHeight: number;
}

export function DynamicRenderer({ 
  elements, 
  canvasWidth, 
  canvasHeight 
}: DynamicRendererProps) {
  return (
    <div
      className="relative"
      style={{
        width: canvasWidth,
        height: canvasHeight,
        background: "#ffffff",
      }}
    >
      {elements.map((element) => (
        <DynamicElement key={element.id} element={element} />
      ))}
    </div>
  );
}

interface DynamicElementProps {
  element: RenderElement;
}

function DynamicElement({ element }: DynamicElementProps) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    zIndex: element.zIndex,
    padding: element.style.padding ? 
      `${element.style.padding.top}px ${element.style.padding.right}px ${element.style.padding.bottom}px ${element.style.padding.left}px` : 
      undefined,
  };

  switch (element.type) {
    case "text":
      return (
        <div
          style={{
            ...baseStyle,
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
          }}
        >
          {element.props.content}
        </div>
      );

    case "image":
      return (
        <div style={baseStyle}>
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
        <div style={baseStyle}>
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
        </div>
      );

    case "container":
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: element.style.backgroundColor,
            borderRadius: element.style.borderRadius,
            borderStyle: element.style.borderStyle,
            borderWidth: element.style.borderWidth,
            borderColor: element.style.borderColor,
            boxShadow: getBoxShadow(element.style.boxShadow),
          }}
        />
      );

    case "accordion":
      return (
        <div style={baseStyle}>
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
        </div>
      );

    case "calendar":
      return (
        <div style={baseStyle}>
          <Calendar
            mode={element.props.mode}
            selected={element.props.selectedDate}
            onSelect={() => {}} // 읽기 전용
            disabled={element.props.disabled}
            showOutsideDays={element.props.showOutsideDays}
            defaultMonth={element.props.defaultMonth}
            fixedWeeks={element.props.fixedWeeks}
            weekStartsOn={element.props.weekStartsOn}
            className="rounded-md border"
          />
        </div>
      );

    default:
      console.warn(`Unknown element type: ${element.type}`);
      return (
        <div
          style={{
            ...baseStyle,
            border: "1px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
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