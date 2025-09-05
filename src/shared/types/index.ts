// 기본 요소 타입
export type ElementType =
  | "text"
  | "image"
  | "button"
  | "container"
  | "accordion"
  | "calendar";

// 스타일 속성 인터페이스
export interface SpacingStyle {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 크기 타입 정의
export type SizeValue = number | "auto";

// 기본 요소 인터페이스
export interface BaseElement extends SpacingStyle {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: SizeValue;
  height: SizeValue;
  zIndex: number;
}

// 텍스트 요소
export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: "left" | "center" | "right";
  fontWeight: "normal" | "bold";
}

// 이미지 요소
export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
}

// 버튼 요소
export interface ButtonElement extends BaseElement {
  type: "button";
  text: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  href?: string;
}

// 컨테이너 요소
export interface ContainerElement extends BaseElement {
  type: "container";
  backgroundColor: string;
  borderRadius: number;
}

// 아코디언 요소
export interface AccordionElement extends BaseElement {
  type: "accordion";
  items: {
    id: string;
    title: string;
    content: string;
  }[];
  variant?: "default" | "outline" | "ghost";
  collapsible?: boolean;
}

// 캘린더 요소
export interface CalendarElement extends BaseElement {
  type: "calendar";
  mode?: "single" | "range" | "multiple";
  selectedDate?: Date;
  selectedDates?: Date[];
  showOutsideDays?: boolean;
  disabled?: boolean;
}

// 모든 요소 타입의 유니온
export type Element =
  | TextElement
  | ImageElement
  | ButtonElement
  | ContainerElement
  | AccordionElement
  | CalendarElement;

// 캔버스 상태
export interface Canvas {
  elements: Element[];
  selectedElementIds: string[];
  width: number;
  height: number;
}

// 그리드 설정
export interface GridConfig {
  showGrid: boolean;
  columns: number;
  rows: number;
  cellSize: number;
  snapToGrid: boolean;
}

// 편집기 상태
export interface EditorState {
  canvas: Canvas;
  history: Canvas[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  grid: GridConfig;
}

// 드래그 앤 드롭 관련 타입
export interface DragData {
  elementId: string;
  elementType: ElementType;
}

// 속성 패널에서 사용할 속성 타입
export interface ElementProperties {
  [key: string]: string | number | boolean | object;
}
