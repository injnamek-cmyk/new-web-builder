// 기본 요소 타입
export type ElementType = "text" | "image" | "button" | "container";

// 스타일 속성 인터페이스
export interface SpacingStyle {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 기본 요소 인터페이스
export interface BaseElement extends SpacingStyle {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
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
  children: string[]; // 자식 요소 ID들
}

// 모든 요소 타입의 유니온
export type Element =
  | TextElement
  | ImageElement
  | ButtonElement
  | ContainerElement;

// 캔버스 상태
export interface Canvas {
  elements: Element[];
  selectedElementId: string | null;
  width: number;
  height: number;
}

// 편집기 상태
export interface EditorState {
  canvas: Canvas;
  history: Canvas[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
}

// 드래그 앤 드롭 관련 타입
export interface DragData {
  elementId: string;
  elementType: ElementType;
}

// 속성 패널에서 사용할 속성 타입
export interface ElementProperties {
  [key: string]: any;
}
