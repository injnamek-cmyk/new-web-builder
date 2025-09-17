// 기본 요소 타입
export type ElementType =
  | "text"
  | "image"
  | "button"
  | "container"
  | "accordion"
  | "calendar"
  | "shape";

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
  textDecoration?: "none" | "underline" | "line-through";
  lineHeight?: number;
}

// 이미지 요소
export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
  filter?: {
    brightness: number;
    contrast: number;
    saturate: number;
    blur: number;
  };
}

// 버튼 요소
export interface ButtonElement extends BaseElement {
  type: "button";
  text: string;
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size: "default" | "sm" | "lg" | "icon";
  href?: string;
  icon?: string; // Lucide icon name
  iconPosition?: "left" | "right";
}

// 레이아웃 모드 타입 (하이브리드 서버 드리븐 UI)
export type LayoutMode = "absolute" | "flex" | "grid" | "flow";

// Flex 레이아웃 속성
export interface FlexLayoutProps {
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: number;
}

// Grid 레이아웃 속성
export interface GridLayoutProps {
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumns?: number; // 컬럼 개수
  gridRows?: number | "auto"; // 행 개수 (auto 허용)
  gridGap?: number;
  gridColumnGap?: number;
  gridRowGap?: number;
  gridAutoFlow?: "row" | "column" | "row dense" | "column dense";
  gridAutoColumns?: string;
  gridAutoRows?: string;
}

// Flow 레이아웃 속성 (일반적인 block/inline 흐름)
export interface FlowLayoutProps {
  display?: "block" | "inline" | "inline-block";
  verticalAlign?:
    | "baseline"
    | "top"
    | "middle"
    | "bottom"
    | "text-top"
    | "text-bottom";
  float?: "none" | "left" | "right";
  clear?: "none" | "left" | "right" | "both";
}

// 컨테이너 요소 (하이브리드 레이아웃 지원)
export interface ContainerElement extends BaseElement {
  type: "container";
  backgroundColor: string;
  borderRadius: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";

  // 하이브리드 레이아웃 시스템 (옵셔널 - 기존 호환성 유지)
  layoutMode?: LayoutMode;
  children?: string[]; // 자식 요소 ID 배열

  // 레이아웃별 속성 (옵셔널)
  flex?: FlexLayoutProps;
  grid?: GridLayoutProps;
  flow?: FlowLayoutProps;

  // 간격 조정 속성 (기존 SpacingStyle.padding 외에 추가)
  gap?: number; // 자식 요소간 간격
  childPadding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }; // 자식 요소들을 위한 내부 패딩
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
  accordionType?: "single" | "multiple";
  disabled?: boolean;
}

// 캘린더 요소
export interface CalendarElement extends BaseElement {
  type: "calendar";
  mode?: "single" | "range" | "multiple";
  selectedDate?: Date;
  selectedDates?: Date[];
  showOutsideDays?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  fixedWeeks?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
}

// 도형 배경 타입
export interface ShapeBackground {
  type: "color" | "image";
  color?: string; // type이 "color"일 때
  imageUrl?: string; // type이 "image"일 때
  imageSize?: "cover" | "contain" | "stretch" | "repeat"; // 이미지 크기 조절 방식
  imagePosition?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
}

// 도형 요소
export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "heart";
  background: ShapeBackground; // 배경 설정 (색상 또는 이미지)
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number; // 모든 도형에 적용 가능
}

// 모든 요소 타입의 유니온
export type Element =
  | TextElement
  | ImageElement
  | ButtonElement
  | ContainerElement
  | AccordionElement
  | CalendarElement
  | ShapeElement;

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

// 페이지 메타데이터 타입 정의
export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

// 웹사이트 관리 타입 정의
export interface Website {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  subdomain: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  pages: Page[];
}

export interface CreateWebsiteRequest {
  name: string;
  description?: string;
  domain?: string;
  subdomain: string;
}

export interface UpdateWebsiteRequest {
  name?: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  isPublished?: boolean;
}

// 페이지 관리 타입 정의 (웹사이트와 연결)
export interface Page {
  id: string;
  title: string;
  path: string;
  content: Element[];
  metadata: PageMetadata;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  websiteId: string;
  website?: Website;
}

export interface CreatePageRequest {
  title: string;
  path: string;
  websiteId: string;
  metadata?: Partial<PageMetadata>;
}

export interface UpdatePageRequest {
  title?: string;
  path?: string;
  content?: Element[];
  metadata?: Partial<PageMetadata>;
  isPublished?: boolean;
}

// 유효성 검사 및 응답 타입
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

export type PageResponse = ApiResponse<Page>;
export type WebsiteResponse = ApiResponse<Website>;
export type WebsitesResponse = ApiResponse<Website[]>;
export type PagesResponse = ApiResponse<Page[]>;
