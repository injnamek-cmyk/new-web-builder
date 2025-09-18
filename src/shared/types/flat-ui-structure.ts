// 플랫한 구조의 서버 드리븐 UI 타입 정의
import { ElementType } from "./index";

export interface FlatUIElement {
  id: string;
  type: ElementType;
  style: Record<string, unknown>;
  content?: string; // 텍스트 내용이나 이미지 경로
  action?: {
    type: string;
    value: string;
  };
  children?: string[]; // 자식 요소들의 ID 배열
}

export type FlatUIStructure = FlatUIElement[];

// Canvas를 플랫한 구조로 변환하는 함수
import {
  Canvas,
  Element,
  ContainerElement,
  TextElement,
  ImageElement,
  ButtonElement,
} from "./index";

export function convertToFlatStructure(canvas: Canvas): FlatUIStructure {
  const result: FlatUIElement[] = [];

  canvas.elements.forEach((element) => {
    const flatElement: FlatUIElement = {
      id: element.id,
      type: element.type,
      style: extractElementStyle(element),
    };

    // 하이브리드 레이아웃 지원 (컨테이너 요소만)
    if (element.type === "container") {
      const containerElement = element as ContainerElement;
      if (
        containerElement.layoutMode &&
        containerElement.layoutMode !== "absolute"
      ) {
        flatElement.style.layoutMode = containerElement.layoutMode;

        if (containerElement.flex) {
          flatElement.style.flexProps = containerElement.flex;
        }
        if (containerElement.grid) {
          flatElement.style.gridProps = containerElement.grid;
        }
        if (containerElement.flow) {
          flatElement.style.flowProps = containerElement.flow;
        }
      }
    }

    // 자식 요소 정보 추가 (컨테이너 요소만)
    if (element.type === "container") {
      const containerElement = element as ContainerElement;
      if (containerElement.children && containerElement.children.length > 0) {
        flatElement.children = containerElement.children;
      }
    }

    // content 설정
    switch (element.type) {
      case "text":
        flatElement.content = (element as TextElement).content;
        break;
      case "image":
        flatElement.content = (element as ImageElement).src;
        break;
      case "button":
        const buttonElement = element as ButtonElement;
        flatElement.content = buttonElement.text;
        if (buttonElement.href) {
          flatElement.action = {
            type: "페이지 이동",
            value: buttonElement.href,
          };
        }
        break;
    }

    result.push(flatElement);
  });

  return result;
}

function extractElementStyle(element: Element): Record<string, unknown> {
  const style: Record<string, unknown> = {
    position: {
      x: element.x,
      y: element.y,
    },
    size: {
      width: element.width,
      height: element.height,
    },
    zIndex: element.zIndex,
  };

  if (element.padding) {
    style.padding = element.padding;
  }

  switch (element.type) {
    case "text":
      const textElement = element as TextElement;
      return {
        ...style,
        fontSize: textElement.fontSize,
        fontFamily: textElement.fontFamily,
        color: textElement.color,
        textAlign: textElement.textAlign,
        fontWeight: textElement.fontWeight,
        textDecoration: textElement.textDecoration,
        lineHeight: textElement.lineHeight,
      };

    case "image":
      const imageElement = element as ImageElement;
      return {
        ...style,
        objectFit: imageElement.objectFit,
        objectPosition: imageElement.objectPosition,
        filter: imageElement.filter,
      };

    case "button":
      const buttonElement = element as ButtonElement;
      return {
        ...style,
        variant: buttonElement.variant,
        size: buttonElement.size,
      };

    case "container":
      const containerElement = element as ContainerElement;
      return {
        ...style,
        backgroundColor: containerElement.backgroundColor,
        borderRadius: containerElement.borderRadius,
        borderStyle: containerElement.borderStyle,
        borderWidth: containerElement.borderWidth,
        borderColor: containerElement.borderColor,
        boxShadow: containerElement.boxShadow,
      };

    default:
      return style;
  }
}
