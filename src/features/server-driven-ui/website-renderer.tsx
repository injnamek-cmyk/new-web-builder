"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Element } from "@/shared/types";
import { WebsiteRenderData } from "@/shared/types/server-driven-ui";
import { renderIcon } from "@/shared/lib/icon-utils";

interface WebsiteRendererProps {
  websiteData: WebsiteRenderData;
  currentPagePath?: string; // 현재 표시할 페이지 경로
}

export function WebsiteRenderer({
  websiteData,
  currentPagePath = "/", // 기본값은 루트 페이지
}: WebsiteRendererProps) {
  const [currentPath, setCurrentPath] = useState(currentPagePath);

  // 가상 페이지 전환 함수
  const navigateToPage = (pageId: string) => {
    // pageId로 페이지 찾기 (실제로는 페이지 슬러그나 경로를 사용해야 함)
    const targetPage = websiteData.pages.find(page =>
      page.path === `/${pageId}` ||
      page.path === pageId ||
      pageId === 'home' && page.path === '/'
    );

    if (targetPage) {
      setCurrentPath(targetPage.path);
    }
  };

  // 현재 페이지 찾기 (루트 경로 우선)
  const currentPage = websiteData.pages.find(page => page.path === currentPath)
    || websiteData.pages.find(page => page.path === "/")
    || websiteData.pages[0];

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600">요청한 페이지가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  // 요소들을 ID로 매핑
  const elementMap = new Map<string, Element>();
  currentPage.content.forEach((element) => {
    elementMap.set(element.id, element);
  });

  // 최상위 요소들 찾기 (컨테이너의 children에 포함되지 않은 요소들)
  const topLevelElements = currentPage.content.filter((element) => {
    return !currentPage.content.some((parent) =>
      parent.type === "container" &&
      "children" in parent &&
      parent.children?.includes(element.id)
    );
  });

  return (
    <div
      className="relative bg-white"
      style={{
        width: "1920px",
        height: "1080px",
        margin: "0 auto",
      }}
    >
      {topLevelElements.map((element) => (
        <WebsiteElement
          key={element.id}
          element={element}
          elementMap={elementMap}
          isTopLevel={true}
          navigateToPage={navigateToPage}
        />
      ))}
    </div>
  );
}

interface WebsiteElementProps {
  element: Element;
  elementMap: Map<string, Element>;
  isTopLevel?: boolean;
  navigateToPage?: (pageId: string) => void;
}

function WebsiteElement({
  element,
  elementMap,
  isTopLevel = false,
  navigateToPage,
}: WebsiteElementProps) {
  // 컨테이너의 자식 요소들 가져오기
  const getChildElements = (): Element[] => {
    if (element.type === "container" && "children" in element && element.children) {
      return element.children
        .map((childId) => elementMap.get(childId))
        .filter(Boolean) as Element[];
    }
    return [];
  };

  const childElements = getChildElements();

  // 포지션과 레이아웃 스타일 적용
  const getElementStyle = (isTopLevel: boolean = false): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      zIndex: element.zIndex,
      padding: `${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`,
    };

    // 최상위 요소는 항상 absolute positioning
    if (isTopLevel) {
      baseStyle.position = "absolute";
      baseStyle.left = element.x;
      baseStyle.top = element.y;
    }

    // 크기 설정
    if (element.width !== "auto") {
      baseStyle.width = element.width;
    }
    if (element.height !== "auto") {
      baseStyle.height = element.height;
    }

    return baseStyle;
  };

  const elementStyle = getElementStyle(isTopLevel);

  // 컨테이너 타입의 경우 자식 요소들을 렌더링
  if (element.type === "container") {
    const containerElement = element as Extract<Element, { type: "container" }>;

    const containerLayoutStyle: React.CSSProperties = {};

    // 레이아웃 모드에 따른 스타일 적용
    switch (containerElement.layoutMode) {
      case "flex":
        containerLayoutStyle.display = "flex";
        containerLayoutStyle.flexDirection = containerElement.flex?.flexDirection || "row";
        containerLayoutStyle.justifyContent = containerElement.flex?.justifyContent || "flex-start";
        containerLayoutStyle.alignItems = containerElement.flex?.alignItems || "stretch";
        containerLayoutStyle.gap = containerElement.gap ?? containerElement.flex?.gap ?? 0;
        break;
      case "grid":
        containerLayoutStyle.display = "grid";
        containerLayoutStyle.gridTemplateColumns = containerElement.grid?.gridTemplateColumns || "1fr";
        containerLayoutStyle.gridTemplateRows = containerElement.grid?.gridTemplateRows || "auto";
        containerLayoutStyle.gap = containerElement.gap ?? containerElement.grid?.gridGap ?? 0;
        break;
      case "flow":
        containerLayoutStyle.display = containerElement.flow?.display || "block";
        if (containerElement.flow?.float) {
          containerLayoutStyle.float = containerElement.flow.float;
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
          backgroundColor: containerElement.backgroundColor,
          borderRadius: containerElement.borderRadius,
          borderStyle: containerElement.borderStyle || "none",
          borderWidth: containerElement.borderWidth || 0,
          borderColor: containerElement.borderColor,
          boxShadow: getBoxShadow(containerElement.boxShadow),
        }}
      >
        {childElements.map((child) => (
          <WebsiteElement
            key={child.id}
            element={child}
            elementMap={elementMap}
            navigateToPage={navigateToPage}
          />
        ))}
      </div>
    );
  }

  // 다른 요소 타입들은 기존 방식대로 렌더링
  return <div style={elementStyle}>{renderElementContent(element, navigateToPage)}</div>;
}

function renderElementContent(element: Element, navigateToPage?: (pageId: string) => void) {
  switch (element.type) {
    case "text":
      const textElement = element as Extract<Element, { type: "text" }>;
      return (
        <div
          style={{
            fontSize: textElement.fontSize,
            fontFamily: textElement.fontFamily,
            color: textElement.color,
            textAlign: textElement.textAlign,
            fontWeight: textElement.fontWeight,
            textDecoration: textElement.textDecoration,
            lineHeight: textElement.lineHeight,
            display: "flex",
            alignItems: "center",
            justifyContent:
              textElement.textAlign === "center"
                ? "center"
                : textElement.textAlign === "right"
                ? "flex-end"
                : "flex-start",
            width: "100%",
            height: "100%",
          }}
        >
          {textElement.content}
        </div>
      );

    case "image":
      const imageElement = element as Extract<Element, { type: "image" }>;
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src={imageElement.src || ""}
            alt={imageElement.alt || ""}
            fill
            style={{
              objectFit: imageElement.objectFit || "fill",
              objectPosition: imageElement.objectPosition || "center",
              filter: imageElement.filter
                ? `brightness(${imageElement.filter.brightness ?? 100}%) contrast(${
                    imageElement.filter.contrast ?? 100
                  }%) saturate(${imageElement.filter.saturate ?? 100}%) blur(${
                    imageElement.filter.blur ?? 0
                  }px)`
                : undefined,
            }}
          />
        </div>
      );

    case "button":
      const buttonElement = element as Extract<Element, { type: "button" }>;

      const handleButtonClick = () => {
        // 새로운 링크 시스템 우선 처리
        if (buttonElement.actionType === "link" || !buttonElement.actionType) {
          if (buttonElement.linkType === "page" && buttonElement.targetPageId) {
            // 페이지 내 가상 라우팅
            navigateToPage?.(buttonElement.targetPageId);
          } else if (buttonElement.linkType === "custom" && buttonElement.customUrl) {
            // 외부 URL로 이동
            window.open(buttonElement.customUrl, "_blank");
          } else if (buttonElement.href) {
            // 이전 방식 호환
            window.open(buttonElement.href, "_blank");
          }
        }
        // actionType === "action"인 경우는 아직 구현하지 않음
      };

      return (
        <Button
          variant={buttonElement.variant || "default"}
          size={buttonElement.size || "default"}
          onClick={handleButtonClick}
        >
          {buttonElement.icon && buttonElement.icon !== "none" && buttonElement.iconPosition === "left" &&
            renderIcon(buttonElement.icon, "w-4 h-4 mr-2")
          }
          {buttonElement.text}
          {buttonElement.icon && buttonElement.icon !== "none" && buttonElement.iconPosition === "right" &&
            renderIcon(buttonElement.icon, "w-4 h-4 ml-2")
          }
        </Button>
      );

    case "accordion":
      const accordionElement = element as Extract<Element, { type: "accordion" }>;
      return (
        <Accordion
          type={accordionElement.accordionType || "single"}
          collapsible={accordionElement.collapsible}
          disabled={accordionElement.disabled}
          className="w-full h-full"
        >
          {accordionElement.items?.map((item, index) => (
            <AccordionItem
              key={item.id || index}
              value={item.id || `item-${index}`}
            >
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

    case "calendar":
      const calendarElement = element as Extract<Element, { type: "calendar" }>;
      return (
        <Calendar
          mode="single"
          selected={calendarElement.selectedDate}
          onSelect={() => {}} // 읽기 전용
          disabled={calendarElement.disabled}
          showOutsideDays={calendarElement.showOutsideDays}
          defaultMonth={calendarElement.defaultMonth}
          fixedWeeks={calendarElement.fixedWeeks}
          weekStartsOn={calendarElement.weekStartsOn}
          className="rounded-md border w-full h-full"
        />
      );

    case "shape":
      const shapeElement = element as Extract<Element, { type: "shape" }>;
      if (shapeElement.shapeType === "triangle") {
        return renderTriangleSVG(shapeElement);
      }
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            ...getShapeStyles(shapeElement),
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

function renderTriangleSVG(element: Extract<Element, { type: "shape" }>) {
  const width = typeof element.width === "number" ? element.width : 100;
  const height = typeof element.height === "number" ? element.height : 100;
  const patternId = `triangle-pattern-${Math.random()
    .toString(36)
    .substring(2, 11)}`;

  const actualBackgroundColor =
    element.background?.type === "color"
      ? element.background.color
      : "#3b82f6";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "visible",
        borderRadius:
          element.borderRadius && element.borderRadius > 0
            ? `${element.borderRadius}px`
            : 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", overflow: "visible" }}
      >
        {element.background?.type === "image" &&
          element.background.imageUrl && (
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
                    element.background.imageSize === "cover"
                      ? "xMidYMid slice"
                      : element.background.imageSize === "contain"
                      ? "xMidYMid meet"
                      : "none"
                  }
                />
              </pattern>
            </defs>
          )}
        <polygon
          points={`${width / 2},10 10,${height - 10} ${width - 10},${
            height - 10
          }`}
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

function getShapeStyles(element: Extract<Element, { type: "shape" }>): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    border: `${element.borderWidth || 0}px ${element.borderStyle || "solid"} ${
      element.borderColor || "transparent"
    }`,
  };

  // 배경 스타일 설정
  if (element.background) {
    if (element.background.type === "color") {
      baseStyle.backgroundColor = element.background.color;
    } else if (
      element.background.type === "image" &&
      element.background.imageUrl
    ) {
      baseStyle.backgroundImage = `url(${element.background.imageUrl})`;
      baseStyle.backgroundPosition =
        element.background.imagePosition || "center";

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
      baseStyle.borderRadius = element.borderRadius
        ? `${element.borderRadius}px`
        : "0px";
      break;
    case "triangle":
      // SVG로 렌더링하므로 특별한 스타일 불필요
      break;
    default:
      break;
  }

  return baseStyle;
}