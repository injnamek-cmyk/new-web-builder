import {
  Element,
  TextElement,
  ImageElement,
  ButtonElement,
  ContainerElement,
  ElementType,
} from "@/shared/types";

export function createElement(
  type: ElementType,
  id: string,
  x: number = 100,
  y: number = 100
): Element {
  const baseElement = {
    id,
    x,
    y,
    zIndex: 0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  switch (type) {
    case "text":
      return {
        ...baseElement,
        type: "text",
        width: 200,
        height: 50,
        content: "새 텍스트",
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        color: "#000000",
        textAlign: "left",
        fontWeight: "normal",
      } as TextElement;

    case "image":
      return {
        ...baseElement,
        type: "image",
        width: 200,
        height: 150,
        src: "",
        alt: "이미지",
        objectFit: "cover",
      } as ImageElement;

    case "button":
      return {
        ...baseElement,
        type: "button",
        width: 120,
        height: 40,
        text: "버튼",
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        borderRadius: 4,
        padding: {
          top: 8,
          right: 16,
          bottom: 8,
          left: 16,
        },
      } as ButtonElement;

    case "container":
      return {
        ...baseElement,
        type: "container",
        width: 300,
        height: 200,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        padding: {
          top: 16,
          right: 16,
          bottom: 16,
          left: 16,
        },
        children: [],
      } as ContainerElement;

    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
