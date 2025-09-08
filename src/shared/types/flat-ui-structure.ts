// 플랫한 구조의 서버 드리븐 UI 타입 정의

export interface FlatUIElement {
  id: string;
  type: string;
  style: Record<string, any>;
  content?: string; // 텍스트 내용이나 이미지 경로
  action?: {
    type: string;
    value: string;
  };
  children?: string[]; // 자식 요소들의 ID 배열
}

export type FlatUIStructure = FlatUIElement[];

// Canvas를 플랫한 구조로 변환하는 함수
import { Canvas } from "@/shared/types";

export function convertToFlatStructure(canvas: Canvas): FlatUIStructure {
  const result: FlatUIElement[] = [];
  
  canvas.elements.forEach(element => {
    const flatElement: FlatUIElement = {
      id: element.id,
      type: element.type,
      style: extractElementStyle(element),
    };

    // 하이브리드 레이아웃 지원
    if ((element as any).layoutMode && (element as any).layoutMode !== 'absolute') {
      flatElement.style.layoutMode = (element as any).layoutMode;
      
      if ((element as any).flexProps) {
        flatElement.style.flexProps = (element as any).flexProps;
      }
      if ((element as any).gridProps) {
        flatElement.style.gridProps = (element as any).gridProps;
      }
      if ((element as any).flowProps) {
        flatElement.style.flowProps = (element as any).flowProps;
      }
    }

    // 자식 요소 정보 추가
    if ((element as any).children && (element as any).children.length > 0) {
      flatElement.children = (element as any).children;
    }

    // content 설정
    switch (element.type) {
      case "text":
        flatElement.content = (element as any).content;
        break;
      case "image":
        flatElement.content = (element as any).src;
        break;
      case "button":
        flatElement.content = (element as any).text;
        if ((element as any).href) {
          flatElement.action = {
            type: "페이지 이동",
            value: (element as any).href
          };
        }
        break;
    }

    result.push(flatElement);
  });

  return result;
}

function extractElementStyle(element: any): Record<string, any> {
  const style: any = {
    position: {
      x: element.x,
      y: element.y
    },
    size: {
      width: element.width,
      height: element.height
    },
    zIndex: element.zIndex,
  };

  if (element.padding) {
    style.padding = element.padding;
  }

  switch (element.type) {
    case "text":
      return {
        ...style,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        textAlign: element.textAlign,
        fontWeight: element.fontWeight,
        textDecoration: element.textDecoration,
        lineHeight: element.lineHeight,
      };
    
    case "image":
      return {
        ...style,
        objectFit: element.objectFit,
        objectPosition: element.objectPosition,
        filter: element.filter,
      };
    
    case "button":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        textColor: element.textColor,
        borderRadius: element.borderRadius,
        variant: element.variant,
        size: element.size,
      };
    
    case "container":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        borderRadius: element.borderRadius,
        borderStyle: element.borderStyle,
        borderWidth: element.borderWidth,
        borderColor: element.borderColor,
        boxShadow: element.boxShadow,
      };
    
    default:
      return style;
  }
}