"use client";

import React, { useMemo } from "react";
import { 
  EnhancedPageRenderData, 
  EnhancedRenderElement, 
  LayoutContainer,
  ResponsiveValue,
  EnhancedPosition,
  EnhancedSize 
} from "@/shared/types/enhanced-server-driven-ui";
import { DynamicElement } from "./dynamic-element";

interface EnhancedRendererProps {
  pageData: EnhancedPageRenderData;
  viewport?: {
    width: number;
    height: number;
  };
}

export function EnhancedRenderer({ 
  pageData, 
  viewport = { width: 1920, height: 1080 }
}: EnhancedRendererProps) {
  // 현재 브레이크포인트 결정
  const currentBreakpoint = useMemo(() => {
    const { breakpoints } = pageData.canvas;
    
    return breakpoints.find(bp => 
      viewport.width >= bp.minWidth && 
      (bp.maxWidth === undefined || viewport.width <= bp.maxWidth)
    ) || breakpoints[0];
  }, [pageData.canvas.breakpoints, viewport.width]);

  // 반응형 값 해결 함수
  const resolveResponsiveValue = <T,>(value: ResponsiveValue<T>): T => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value[currentBreakpoint.name] || value['default'] || Object.values(value)[0];
    }
    return value;
  };

  return (
    <div
      className="relative w-full h-full overflow-auto"
      style={{
        minWidth: pageData.canvas.baseWidth,
        minHeight: pageData.canvas.baseHeight,
      }}
    >
      {/* 전역 스타일 적용 */}
      {pageData.canvas.globalStyles?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: pageData.canvas.globalStyles.customCSS }} />
      )}
      
      {/* 루트 컨테이너 렌더링 */}
      <LayoutContainerRenderer
        container={pageData.canvas.root}
        resolveResponsiveValue={resolveResponsiveValue}
        currentBreakpoint={currentBreakpoint.name}
      />
    </div>
  );
}

interface LayoutContainerRendererProps {
  container: LayoutContainer;
  resolveResponsiveValue: <T>(value: ResponsiveValue<T>) => T;
  currentBreakpoint: string;
}

function LayoutContainerRenderer({ 
  container, 
  resolveResponsiveValue,
  currentBreakpoint 
}: LayoutContainerRendererProps) {
  // 반응형 숨김/표시 처리
  if (container.responsive?.hideOn?.includes(currentBreakpoint) ||
      (container.responsive?.showOn && !container.responsive.showOn.includes(currentBreakpoint))) {
    return null;
  }

  const position = container.position;
  const size = container.size;
  const style = container.style;

  // 컨테이너 스타일 생성
  const containerStyle: React.CSSProperties = {
    // 크기
    width: resolveResponsiveValue(size.width),
    height: resolveResponsiveValue(size.height),
    minWidth: size.minWidth ? resolveResponsiveValue(size.minWidth) : undefined,
    maxWidth: size.maxWidth ? resolveResponsiveValue(size.maxWidth) : undefined,
    minHeight: size.minHeight ? resolveResponsiveValue(size.minHeight) : undefined,
    maxHeight: size.maxHeight ? resolveResponsiveValue(size.maxHeight) : undefined,
    aspectRatio: size.aspectRatio ? resolveResponsiveValue(size.aspectRatio) : undefined,
    
    // 배경 및 테두리
    backgroundColor: style.backgroundColor ? resolveResponsiveValue(style.backgroundColor) : undefined,
    borderRadius: style.borderRadius ? resolveResponsiveValue(style.borderRadius) : undefined,
    boxShadow: style.boxShadow ? resolveResponsiveValue(style.boxShadow) : undefined,
    
    // 패딩
    ...(style.padding && {
      padding: (() => {
        const padding = resolveResponsiveValue(style.padding);
        return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
      })()
    }),
    
    // 테두리
    ...(style.border && {
      border: (() => {
        const border = resolveResponsiveValue(style.border);
        return `${border.width}px ${border.style} ${border.color}`;
      })()
    }),
  };

  // 포지션 모드에 따른 스타일 적용
  switch (position.mode) {
    case "absolute":
      if (position.absolute) {
        containerStyle.position = "absolute";
        containerStyle.left = resolveResponsiveValue(position.absolute.x);
        containerStyle.top = resolveResponsiveValue(position.absolute.y);
        containerStyle.zIndex = position.absolute.zIndex;
      }
      break;
      
    case "flex":
      if (position.flex) {
        containerStyle.display = "flex";
        containerStyle.flexDirection = resolveResponsiveValue(position.flex.direction);
        containerStyle.justifyContent = resolveResponsiveValue(position.flex.justify);
        containerStyle.alignItems = resolveResponsiveValue(position.flex.align);
        containerStyle.flexWrap = resolveResponsiveValue(position.flex.wrap);
        containerStyle.gap = `${resolveResponsiveValue(position.flex.gap)}px`;
        containerStyle.flex = position.flex.flex;
      }
      break;
      
    case "grid":
      if (position.grid) {
        containerStyle.display = "grid";
        containerStyle.gridTemplateColumns = resolveResponsiveValue(position.grid.templateColumns);
        containerStyle.gridTemplateRows = resolveResponsiveValue(position.grid.templateRows);
        
        const gap = resolveResponsiveValue(position.grid.gap);
        containerStyle.rowGap = `${gap.row}px`;
        containerStyle.columnGap = `${gap.column}px`;
        
        if (position.grid.columnStart) {
          containerStyle.gridColumnStart = resolveResponsiveValue(position.grid.columnStart);
        }
        if (position.grid.columnEnd) {
          containerStyle.gridColumnEnd = resolveResponsiveValue(position.grid.columnEnd);
        }
        if (position.grid.rowStart) {
          containerStyle.gridRowStart = resolveResponsiveValue(position.grid.rowStart);
        }
        if (position.grid.rowEnd) {
          containerStyle.gridRowEnd = resolveResponsiveValue(position.grid.rowEnd);
        }
        if (position.grid.area) {
          containerStyle.gridArea = resolveResponsiveValue(position.grid.area);
        }
      }
      break;
      
    case "flow":
      if (position.flow) {
        containerStyle.display = resolveResponsiveValue(position.flow.display);
        containerStyle.float = position.flow.float ? resolveResponsiveValue(position.flow.float) : undefined;
        containerStyle.clear = position.flow.clear ? resolveResponsiveValue(position.flow.clear) : undefined;
        
        const margin = resolveResponsiveValue(position.flow.margin);
        containerStyle.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
      }
      break;
  }

  return (
    <div style={containerStyle}>
      {container.children.map((child) => {
        if ('children' in child) {
          // 하위 컨테이너
          return (
            <LayoutContainerRenderer
              key={child.id}
              container={child as LayoutContainer}
              resolveResponsiveValue={resolveResponsiveValue}
              currentBreakpoint={currentBreakpoint}
            />
          );
        } else {
          // 일반 요소
          return (
            <EnhancedElementRenderer
              key={child.id}
              element={child as EnhancedRenderElement}
              resolveResponsiveValue={resolveResponsiveValue}
              currentBreakpoint={currentBreakpoint}
            />
          );
        }
      })}
    </div>
  );
}

interface EnhancedElementRendererProps {
  element: EnhancedRenderElement;
  resolveResponsiveValue: <T>(value: ResponsiveValue<T>) => T;
  currentBreakpoint: string;
}

function EnhancedElementRenderer({ 
  element, 
  resolveResponsiveValue,
  currentBreakpoint 
}: EnhancedElementRendererProps) {
  // 반응형 숨김/표시 처리
  if (element.responsive?.hideOn?.includes(currentBreakpoint) ||
      (element.responsive?.showOn && !element.responsive.showOn.includes(currentBreakpoint))) {
    return null;
  }

  const position = element.position;
  const size = element.size;

  // 요소 스타일 생성
  const elementStyle: React.CSSProperties = {
    // 크기
    width: resolveResponsiveValue(size.width),
    height: resolveResponsiveValue(size.height),
    minWidth: size.minWidth ? resolveResponsiveValue(size.minWidth) : undefined,
    maxWidth: size.maxWidth ? resolveResponsiveValue(size.maxWidth) : undefined,
    minHeight: size.minHeight ? resolveResponsiveValue(size.minHeight) : undefined,
    maxHeight: size.maxHeight ? resolveResponsiveValue(size.maxHeight) : undefined,
    aspectRatio: size.aspectRatio ? resolveResponsiveValue(size.aspectRatio) : undefined,
  };

  // 포지션 모드에 따른 스타일 적용
  switch (position.mode) {
    case "absolute":
      if (position.absolute) {
        elementStyle.position = "absolute";
        elementStyle.left = resolveResponsiveValue(position.absolute.x);
        elementStyle.top = resolveResponsiveValue(position.absolute.y);
        elementStyle.zIndex = position.absolute.zIndex;
      }
      break;
      
    case "flex":
      if (position.flex) {
        elementStyle.flex = position.flex.flex;
      }
      break;
      
    case "grid":
      if (position.grid) {
        if (position.grid.columnStart) {
          elementStyle.gridColumnStart = resolveResponsiveValue(position.grid.columnStart);
        }
        if (position.grid.columnEnd) {
          elementStyle.gridColumnEnd = resolveResponsiveValue(position.grid.columnEnd);
        }
        if (position.grid.rowStart) {
          elementStyle.gridRowStart = resolveResponsiveValue(position.grid.rowStart);
        }
        if (position.grid.rowEnd) {
          elementStyle.gridRowEnd = resolveResponsiveValue(position.grid.rowEnd);
        }
        if (position.grid.area) {
          elementStyle.gridArea = resolveResponsiveValue(position.grid.area);
        }
      }
      break;
      
    case "flow":
      if (position.flow) {
        elementStyle.display = resolveResponsiveValue(position.flow.display);
        elementStyle.float = position.flow.float ? resolveResponsiveValue(position.flow.float) : undefined;
        elementStyle.clear = position.flow.clear ? resolveResponsiveValue(position.flow.clear) : undefined;
        
        const margin = resolveResponsiveValue(position.flow.margin);
        elementStyle.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
      }
      break;
  }

  // 스타일 객체의 반응형 값들 해결
  const resolvedStyle: Record<string, any> = {};
  Object.entries(element.style).forEach(([key, value]) => {
    resolvedStyle[key] = resolveResponsiveValue(value);
  });

  // 기존 DynamicElement를 래핑하여 향상된 스타일 적용
  return (
    <div style={elementStyle}>
      <DynamicElement
        element={{
          id: element.id,
          type: element.type,
          position: { x: 0, y: 0 }, // 래퍼에서 포지션 처리
          size: { width: '100%', height: '100%' },
          zIndex: 0,
          style: resolvedStyle,
          props: element.props,
        }}
      />
    </div>
  );
}