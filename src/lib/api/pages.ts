import { apiClient } from '@/lib/api';
import { Page } from '@prisma/client';

export interface CreatePageRequest {
  title: string;
  canvas: {
    elements: any[];
    selectedElementIds: string[];
    width: number;
    height: number;
  };
}

export interface UpdatePageRequest {
  title: string;
  canvas: any;
}

export interface PageListResponse {
  pages: Page[];
}

export interface PageResponse {
  page: Page;
}

export interface CreatePageResponse {
  message: string;
  page: Page;
}

export interface DeletePageResponse {
  message: string;
}

// 페이지 목록 조회
export const getPages = async (): Promise<Page[]> => {
  const response = await apiClient.get<PageListResponse>('/api/pages');
  return response.pages;
};

// 특정 페이지 조회
export const getPage = async (id: string): Promise<Page> => {
  const response = await apiClient.get<PageResponse>(`/api/pages/${id}`);
  return response.page;
};

// 새 페이지 생성
export const createPage = async (data: CreatePageRequest): Promise<Page> => {
  const response = await apiClient.post<CreatePageResponse>('/api/pages', data);
  return response.page;
};

// 페이지 업데이트
export const updatePage = async (id: string, data: UpdatePageRequest): Promise<Page> => {
  const response = await apiClient.put<PageResponse>(`/api/pages/${id}`, data);
  return response.page;
};

// 페이지 삭제
export const deletePage = async (id: string): Promise<void> => {
  await apiClient.delete<DeletePageResponse>(`/api/pages/${id}`);
};