import {
  Element,
  TextElement,
  ImageElement,
  ButtonElement,
  ContainerElement,
  AccordionElement,
  CalendarElement,
  ShapeElement,
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
        fontFamily: "Inter",
        color: "hsl(var(--foreground))",
        textAlign: "left",
        fontWeight: "normal",
        textDecoration: "none",
        lineHeight: 1.5,
        ...options,
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
        objectPosition: "center",
        filter: {
          brightness: 100,
          contrast: 100,
          saturate: 100,
          blur: 0,
        },
        ...options,
      } as ImageElement;

    case "button":
      return {
        ...baseElement,
        type: "button",
        width: "auto",
        height: "auto",
        text: "버튼",
        variant: "default",
        size: "default",
        icon: "none",
        iconPosition: "left",
        ...options,
      } as ButtonElement;

    case "container":
      return {
        ...baseElement,
        type: "container",
        width: "auto",
        height: "auto",
        backgroundColor: "hsl(var(--card))",
        borderRadius: 8,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "hsl(var(--border))",
        boxShadow: "sm",
        padding: {
          top: 16,
          right: 16,
          bottom: 16,
          left: 16,
        },
        // 기본값을 flex로 설정
        layoutMode: "flex",
        children: [],
        gap: 8,
        flex: {
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "stretch",
          flexWrap: "nowrap",
        },
        grid: {
          gridTemplateColumns: "1fr",
          gridTemplateRows: "auto",
          gridGap: 8,
        },
        flow: {
          display: "block",
        },
        childPadding: {
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
        accordionType: "single",
        collapsible: true,
        disabled: false,
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
        defaultMonth: new Date(),
        fixedWeeks: false,
        weekStartsOn: 0,
        ...options,
      } as CalendarElement;

    case "shape":
      return {
        ...baseElement,
        type: "shape",
        width: 100,
        height: 100,
        shapeType: "rectangle",
        backgroundColor: "hsl(var(--primary))",
        borderColor: "hsl(var(--border))",
        borderWidth: 2,
        borderStyle: "solid",
        borderRadius: 8,
        ...options,
      } as ShapeElement;

    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function createShapeElement(
  shapeType: "rectangle" | "circle" | "triangle",
  id: string,
  x: number = 100,
  y: number = 100,
  options?: Partial<ShapeElement>
): ShapeElement {
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
  };

  // 도형 타입별 기본 색상 설정
  const shapeColors = {
    rectangle: "#3b82f6", // 파란색
    circle: "#ef4444", // 빨간색
    triangle: "#10b981", // 초록색
  };

  return {
    ...baseElement,
    type: "shape",
    width: 100,
    height: 100,
    shapeType,
    backgroundColor: shapeColors[shapeType],
    borderColor: "hsl(var(--border))",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: shapeType === "rectangle" ? 8 : 0,
    ...options,
  } as ShapeElement;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
