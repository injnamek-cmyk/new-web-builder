import {
  Element,
  TextElement,
  ImageElement,
  ButtonElement,
  ContainerElement,
  AccordionElement,
  CalendarElement,
  ElementType,
} from "@/shared/types";

export function createElement(
  type: ElementType,
  id: string,
  x: number = 100,
  y: number = 100,
  options?: Partial<Element>
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
    children: [],
    gap: 0,
    autoSize: true,
  };

  switch (type) {
    case "text":
      return {
        ...baseElement,
        type: "text",
        width: "auto",
        height: "auto",
        content: "새 텍스트",
        fontSize: 14,
        fontFamily: "inherit",
        color: "hsl(var(--foreground))",
        textAlign: "left",
        fontWeight: "normal",
      } as TextElement;

    case "image":
      return {
        ...baseElement,
        type: "image",
        width: "auto",
        height: "auto",
        src: "",
        alt: "이미지",
        objectFit: "cover",
      } as ImageElement;

    case "button":
      return {
        ...baseElement,
        type: "button",
        width: "auto",
        height: "auto",
        text: "버튼",
        backgroundColor: "",
        textColor: "",
        borderRadius: 0,
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      } as ButtonElement;

    case "container":
      return {
        ...baseElement,
        type: "container",
        width: "auto",
        height: "auto",
        backgroundColor: "",
        borderRadius: 0,
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        ...options,
      } as ContainerElement;

    case "accordion":
      return {
        ...baseElement,
        type: "accordion",
        width: "auto",
        height: "auto",
        items: [
          {
            id: Math.random().toString(36).substr(2, 9),
            title: "항목 1",
            content: "내용을 입력하세요",
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            title: "항목 2",
            content: "내용을 입력하세요",
          },
        ],
        variant: "default",
        collapsible: true,
        ...options,
      } as AccordionElement;

    case "calendar":
      return {
        ...baseElement,
        type: "calendar",
        width: "auto",
        height: "auto",
        mode: "single",
        showOutsideDays: true,
        disabled: false,
        ...options,
      } as CalendarElement;

    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
