import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  CreatePageRequest,
  UpdatePageRequest
} from '@/lib/api/pages';
import { apiClient } from '@/lib/api';
import { Page } from '@prisma/client';

export const PAGES_QUERY_KEY = 'pages';
export const PAGE_QUERY_KEY = 'page';
export const WEBSITE_PAGES_QUERY_KEY = 'websitePages';

// 페이지 목록 조회
export const usePages = () => {
  return useQuery({
    queryKey: [PAGES_QUERY_KEY],
    queryFn: getPages,
  });
};

// 특정 웹사이트의 페이지 목록 조회
export const useWebsitePages = (websiteId: string | null) => {
  return useQuery({
    queryKey: [WEBSITE_PAGES_QUERY_KEY, websiteId],
    queryFn: async () => {
      if (!websiteId) return [];

      try {
        const response = await apiClient.get<{ success: boolean; data: Page[] }>(
          `/api/pages?websiteId=${websiteId}`
        );

        if (response.success && response.data) {
          return response.data.map((page: Page) => ({
            id: page.id,
            title: page.title,
            path: page.path.startsWith('/') ? page.path.slice(1) : page.path,
          }));
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch website pages:', error);
        return [];
      }
    },
    enabled: !!websiteId,
  });
};

// 특정 페이지 조회
export const usePage = (id: string) => {
  return useQuery({
    queryKey: [PAGE_QUERY_KEY, id],
    queryFn: () => getPage(id),
    enabled: !!id,
  });
};

// 새 페이지 생성
export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePageRequest) => createPage(data),
    onSuccess: (newPage: Page) => {
      // 페이지 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      
      // 새로 생성된 페이지를 캐시에 추가
      queryClient.setQueryData([PAGE_QUERY_KEY, newPage.id], newPage);
    },
  });
};

// 페이지 업데이트
export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageRequest }) => 
      updatePage(id, data),
    onSuccess: (updatedPage: Page) => {
      // 해당 페이지 캐시 업데이트
      queryClient.setQueryData([PAGE_QUERY_KEY, updatedPage.id], updatedPage);
      
      // 페이지 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
    },
  });
};

// 페이지 삭제
export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: (_, deletedId: string) => {
      // 삭제된 페이지를 캐시에서 제거
      queryClient.removeQueries({ queryKey: [PAGE_QUERY_KEY, deletedId] });
      
      // 페이지 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
    },
  });
};