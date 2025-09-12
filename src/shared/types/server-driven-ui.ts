// 서버 드리븐 UI를 위한 타입 정의

// 렌더링을 위한 요소 정의
export interface RenderElement {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number | "auto";
    height: number | "auto";
  };
  zIndex: number;
  style?: Record<string, any>;
  props?: Record<string, any>;
}

// 렌더링을 위한 캔버스 정의
export interface RenderCanvas {
  width: number;
  height: number;
  elements: RenderElement[];
}

// 페이지 렌더 데이터
export interface PageRenderData {
  pageId: string;
  title: string;
  canvas: RenderCanvas;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

// 저장된 페이지 데이터
export interface StoredPageData {
  id: string;
  title: string;
  canvas: import("@/shared/types").Canvas;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입들
export interface PageListResponse {
  pages: StoredPageData[];
}

export interface PageResponse {
  page: StoredPageData;
}

export interface RenderDataResponse {
  data: PageRenderData;
}

export interface CreatePageRequest {
  title: string;
  canvas: import("@/shared/types").Canvas;
}

export interface UpdatePageRequest {
  title?: string;
  canvas?: import("@/shared/types").Canvas;
}

// 에러 응답 타입
export interface ErrorResponse {
  error: string;
}
