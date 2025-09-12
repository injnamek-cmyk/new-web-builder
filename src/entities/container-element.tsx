"use client";

import React from "react";
import { ContainerElement, Element } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { useEditorStore } from "@/processes/editor-store";
import { useMode } from "@/shared/contexts/mode-context";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

interface ContainerElementProps {
  element: ContainerElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  isNested?: boolean;
}

export default function ContainerElementComponent({
  element,
  isSelected,
  onSelect,
  isNested = false,
}: ContainerElementProps) {
  const { canvas } = useEditorStore();
  const { mode } = useMode();

  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };


  // 자식 요소들 찾기
  const childrenElements =
    element.children
      ?.map((childId) => canvas.elements.find((el) => el.id === childId))
      .filter(Boolean) || [];

  // 레이아웃 모드에 따른 스타일 설정
  const layoutMode = element.layoutMode || "flex";
  const gap = element.gap || 8;

  // Flex 속성
  const flexDirection = element.flex?.flexDirection || "row";
  const justifyContent = element.flex?.justifyContent || "flex-start";
  const alignItems = element.flex?.alignItems || "stretch";

  // Grid 속성
  const gridColumns = element.grid?.gridColumns || 2;
  const gridRows = element.grid?.gridRows || "auto";

  // 레이아웃별 스타일 생성
  const getLayoutStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: element.width === "auto" ? "auto" : "100%",
      height: element.height === "auto" ? "auto" : "100%",
      position: "relative" as const,
      minWidth: element.width === "auto" ? "fit-content" : 20,
      minHeight: element.height === "auto" ? "fit-content" : 20,
      backgroundColor: element.backgroundColor,
      borderRadius: `${element.borderRadius}px`,
      borderStyle: element.borderStyle || "dashed",
      borderWidth: element.borderWidth ? `${element.borderWidth}px` : "0",
      borderColor: element.borderColor || "transparent",
      boxShadow: getBoxShadowValue(element.boxShadow),
      padding: `${safePadding.top}px ${safePadding.right}px ${safePadding.bottom}px ${safePadding.left}px`,
      gap: `${gap}px`,
    };

    switch (layoutMode) {
      case "grid":
        return {
          ...baseStyle,
          display: "grid",
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gridTemplateRows: gridRows === "auto" ? "auto" : `repeat(${gridRows}, 1fr)`,
        };
      case "flex":
      default:
        return {
          ...baseStyle,
          display: "flex",
          flexDirection,
          justifyContent,
          alignItems,
        };
    }
  };

  const containerStyle = getLayoutStyle();

  function getBoxShadowValue(shadowType?: string) {
    const shadows = {
      none: "none",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    };
    return shadows[shadowType as keyof typeof shadows] || shadows.none;
  }

  const { selectElement, isSelected: isElementSelected, canvas: { selectedElementIds, elements } } = useEditorStore();

  // 가장 최상위 조상 컨테이너를 찾는 함수
  const findTopLevelContainer = (elementId: string): string => {
    // 현재 요소를 포함하는 컨테이너들을 찾기
    const parentContainer = elements.find(el => 
      el.type === 'container' && 
      (el as ContainerElement).children?.includes(elementId)
    );
    
    if (!parentContainer) {
      // 부모가 없으면 현재 요소가 최상위
      return elementId;
    }
    
    // 재귀적으로 부모의 부모를 찾기
    return findTopLevelContainer(parentContainer.id);
  };

  const handleChildClick = (childId: string, e: React.MouseEvent, isContainer = false, childElement?: Element) => {
    e.stopPropagation();
    
    const currentSelectedId = selectedElementIds[0];
    const isCurrentSelectedSibling = currentSelectedId && element.children?.includes(currentSelectedId);
    
    if (isSelected || isCurrentSelectedSibling) {
      selectElement(childId);
    } else if (!currentSelectedId) {
      // 아무것도 선택되지 않은 상태에서는 최상위 조상 컨테이너를 선택
      const topLevelContainerId = findTopLevelContainer(element.id);
      selectElement(topLevelContainerId);
    } else if (isContainer) {
      // 자식 컨테이너의 경우 최상위 조상 컨테이너를 선택
      const topLevelContainerId = findTopLevelContainer(element.id);
      selectElement(topLevelContainerId);
    } else if (childElement?.type === 'button' && childElement.href && mode === 'preview') {
      // 프리뷰 모드에서만 버튼의 href 처리
      window.open(childElement.href, "_blank");
    }
  };


  const renderChildElement = (childElement: Element) => {
    const isChildSelected = isElementSelected(childElement.id);
    
    // 자식 요소는 상대 위치로 렌더링
    switch (childElement.type) {
      case "text":
        return (
          <div
            key={childElement.id}
            className={cn(
              "cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            style={{
              fontSize: `${childElement.fontSize}px`,
              fontFamily: childElement.fontFamily,
              color: childElement.color,
              textAlign: childElement.textAlign,
              fontWeight: childElement.fontWeight,
              textDecoration: childElement.textDecoration,
              lineHeight: childElement.lineHeight,
            }}
            onClick={(e) => handleChildClick(childElement.id, e)}
          >
            {childElement.content}
          </div>
        );
      case "button":
        return (
          <Button
            key={childElement.id}
            variant={childElement.variant}
            size={childElement.size}
            className={cn(
              "cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            onClick={(e) => handleChildClick(childElement.id, e, false, childElement)}
          >
            {childElement.text}
          </Button>
        );
      case "calendar":
        return (
          <div
            key={childElement.id}
            className={cn(
              "cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            onClick={(e) => handleChildClick(childElement.id, e)}
          >
            <Calendar
              mode="single"
              selected={childElement.selectedDate}
              onSelect={() => {}} // 컨테이너 내에서는 선택 기능 비활성화
              disabled={childElement.disabled}
              className="rounded-md border"
            />
          </div>
        );
      case "accordion":
        return (
          <div
            key={childElement.id}
            className={cn(
              "cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            onClick={(e) => handleChildClick(childElement.id, e)}
          >
            <Accordion
              type={childElement.accordionType || "single"}
              collapsible={childElement.collapsible}
              className="w-full"
            >
              {childElement.items?.map((item: { id: string; title: string; content: string }, index: number) => (
                <AccordionItem key={item.id} value={`item-${index}`}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      case "container":
        return (
          <ContainerElementComponent
            key={childElement.id}
            element={childElement as ContainerElement}
            isSelected={isChildSelected}
            onSelect={(e) => handleChildClick(childElement.id, e, true)}
            isNested={true}
          />
        );
      case "image":
        return (
          <div
            key={childElement.id}
            className={cn(
              "bg-gray-100 border border-gray-300 rounded flex items-center justify-center cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            style={{
              width:
                childElement.width === "auto" ? "100px" : childElement.width,
              height:
                childElement.height === "auto" ? "100px" : childElement.height,
            }}
            onClick={(e) => handleChildClick(childElement.id, e)}
          >
            {childElement.src ? (
              <Image
                src={childElement.src}
                alt={childElement.alt || "이미지"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: childElement.objectFit || "cover",
                  objectPosition: childElement.objectPosition || "center",
                }}
              />
            ) : (
              <span className="text-xs text-gray-500">이미지</span>
            )}
          </div>
        );
      default:
        return (
          <div 
            key={childElement.id} 
            className={cn(
              "bg-gray-200 p-2 rounded cursor-pointer",
              isChildSelected ? "ring-2 ring-green-500 ring-offset-1" : ""
            )}
            onClick={(e) => handleChildClick(childElement.id, e)}
          >
            <span className="text-xs text-gray-500">{childElement.type}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        isNested ? "cursor-pointer select-none" : "absolute cursor-pointer select-none",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      style={isNested ? {} : {
        left: element.x,
        top: element.y,
        zIndex: element.zIndex,
      }}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {childrenElements.length > 0 ? (
          childrenElements.filter((el): el is Element => el !== undefined).map(renderChildElement)
        ) : (
          <div className="text-muted-foreground text-sm opacity-50">
            자식 요소를 추가하세요
          </div>
        )}
      </div>
    </div>
  );
}
