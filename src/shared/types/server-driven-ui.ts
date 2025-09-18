// 서버 드리븐 UI를 위한 타입 정의

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

export interface CreatePageRequest {
  title: string;
  canvas: import("@/shared/types").Canvas;
}

export interface UpdatePageRequest {
  title?: string;
  canvas?: import("@/shared/types").Canvas;
}

// Website 렌더 데이터 (여러 페이지 포함)
export interface WebsiteRenderData {
  websiteId: string;
  name: string;
  description?: string;
  domain?: string;
  subdomain: string;
  isPublished: boolean;
  pages: PageRenderInfo[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

// 페이지 렌더 정보 (Website에 포함되는 페이지)
export interface PageRenderInfo {
  id: string;
  title: string;
  path: string;
  content: import("@/shared/types").Element[];
  metadata: import("@/shared/types").PageMetadata;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}


// Website 렌더 응답 타입
export interface WebsiteRenderResponse {
  data: WebsiteRenderData;
}

// 에러 응답 타입
export interface ErrorResponse {
  error: string;
}
