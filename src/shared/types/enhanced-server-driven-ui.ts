// 향상된 서버 드리븐 UI를 위한 타입 정의

// 레이아웃 모드 정의
export type LayoutMode = "absolute" | "flex" | "grid" | "flow";

// 반응형 브레이크포인트
export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

// 반응형 값 타입
export type ResponsiveValue<T> = T | { [breakpoint: string]: T };

// 향상된 포지션 시스템
export interface EnhancedPosition {
  mode: LayoutMode;
  
  // 절대 포지션 (기존 시스템과 호환)
  absolute?: {
    x: ResponsiveValue<number>;
    y: ResponsiveValue<number>;
    zIndex: number;
  };
  
  // Flexbox 레이아웃
  flex?: {
    direction: ResponsiveValue<"row" | "column" | "row-reverse" | "column-reverse">;
    justify: ResponsiveValue<"flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly">;
    align: ResponsiveValue<"stretch" | "flex-start" | "center" | "flex-end" | "baseline">;
    wrap: ResponsiveValue<"nowrap" | "wrap" | "wrap-reverse">;
    gap: ResponsiveValue<number>;
    flex?: string; // flex 속성 (예: "1", "0 0 auto")
  };
  
  // Grid 레이아웃
  grid?: {
    templateColumns: ResponsiveValue<string>;
    templateRows: ResponsiveValue<string>;
    gap: ResponsiveValue<{ row: number; column: number }>;
    columnStart?: ResponsiveValue<number>;
    columnEnd?: ResponsiveValue<number>;
    rowStart?: ResponsiveValue<number>;
    rowEnd?: ResponsiveValue<number>;
    area?: ResponsiveValue<string>;
  };
  
  // Flow 레이아웃 (일반적인 문서 흐름)
  flow?: {
    display: ResponsiveValue<"block" | "inline" | "inline-block">;
    float?: ResponsiveValue<"none" | "left" | "right">;
    clear?: ResponsiveValue<"none" | "left" | "right" | "both">;
    margin: ResponsiveValue<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>;
  };
}

// 향상된 크기 시스템
export interface EnhancedSize {
  width: ResponsiveValue<number | "auto" | "100%" | "fit-content" | "min-content" | "max-content">;
  height: ResponsiveValue<number | "auto" | "100%" | "fit-content" | "min-content" | "max-content">;
  minWidth?: ResponsiveValue<number>;
  maxWidth?: ResponsiveValue<number>;
  minHeight?: ResponsiveValue<number>;
  maxHeight?: ResponsiveValue<number>;
  aspectRatio?: ResponsiveValue<string>; // 예: "16/9", "1"
}

// 컨테이너 요소 (레이아웃을 담당하는 컨테이너)
export interface LayoutContainer {
  id: string;
  type: "layout-container";
  position: EnhancedPosition;
  size: EnhancedSize;
  children: (EnhancedRenderElement | LayoutContainer)[];
  
  // 컨테이너 스타일
  style: {
    backgroundColor?: ResponsiveValue<string>;
    borderRadius?: ResponsiveValue<number>;
    padding?: ResponsiveValue<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>;
    border?: ResponsiveValue<{
      width: number;
      style: "solid" | "dashed" | "dotted" | "none";
      color: string;
    }>;
    boxShadow?: ResponsiveValue<string>;
  };
  
  // 반응형 설정
  responsive?: {
    hideOn?: string[]; // 숨길 브레이크포인트
    showOn?: string[]; // 표시할 브레이크포인트
  };
}

// 향상된 렌더 요소
export interface EnhancedRenderElement {
  id: string;
  type: string;
  position: EnhancedPosition;
  size: EnhancedSize;
  style: Record<string, ResponsiveValue<any>>;
  props: Record<string, any>;
  
  // 반응형 설정
  responsive?: {
    hideOn?: string[]; // 숨길 브레이크포인트
    showOn?: string[]; // 표시할 브레이크포인트
  };
}

// 향상된 캔버스
export interface EnhancedCanvas {
  // 기본 캔버스 설정
  baseWidth: number;
  baseHeight: number;
  
  // 반응형 브레이크포인트
  breakpoints: ResponsiveBreakpoint[];
  
  // 루트 컨테이너 (전체 페이지 레이아웃)
  root: LayoutContainer;
  
  // 전역 스타일
  globalStyles?: {
    fonts: string[];
    customCSS?: string;
  };
}

// 향상된 페이지 렌더 데이터
export interface EnhancedPageRenderData {
  pageId: string;
  title: string;
  canvas: EnhancedCanvas;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

// 레이아웃 분석 결과
export interface LayoutAnalysis {
  totalElements: number;
  layoutModes: { [mode in LayoutMode]: number };
  complexity: "simple" | "moderate" | "complex";
  performance: {
    estimatedDOMNodes: number;
    renderingComplexity: number;
    responsiveComplexity: number;
  };
  recommendations: string[];
}

// 마이그레이션을 위한 변환 매핑
export interface MigrationMapping {
  legacyElementId: string;
  newContainerPath: string[];
  conversionStrategy: "absolute-to-flex" | "absolute-to-grid" | "keep-absolute" | "convert-to-flow";
  confidenceScore: number; // 0-1 범위
}