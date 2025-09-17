import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Website,
  CreateWebsiteRequest,
  UpdateWebsiteRequest,
  WebsiteResponse,
  WebsitesResponse
} from "@/shared/types";

interface WebsiteState {
  websites: Website[];
  currentWebsite: Website | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWebsites: (websites: Website[]) => void;
  setCurrentWebsite: (website: Website | null) => void;
  addWebsite: (website: Website) => void;
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  removeWebsite: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API calls
  fetchWebsites: () => Promise<void>;
  createWebsite: (data: CreateWebsiteRequest) => Promise<WebsiteResponse>;
  updateWebsiteById: (id: string, data: UpdateWebsiteRequest) => Promise<WebsiteResponse>;
  deleteWebsiteById: (id: string) => Promise<WebsiteResponse>;
  getWebsiteById: (id: string) => Promise<Website | null>;
}

export const useWebsiteStore = create<WebsiteState>()(
  devtools(
    (set, get) => ({
      websites: [],
      currentWebsite: null,
      isLoading: false,
      error: null,

      setWebsites: (websites) => set({ websites }),

      setCurrentWebsite: (website) => set({ currentWebsite: website }),

      addWebsite: (website) => set((state) => ({
        websites: [website, ...state.websites]
      })),

      updateWebsite: (id, updates) => set((state) => ({
        websites: state.websites.map(website =>
          website.id === id ? { ...website, ...updates } : website
        ),
        currentWebsite: state.currentWebsite?.id === id
          ? { ...state.currentWebsite, ...updates }
          : state.currentWebsite
      })),

      removeWebsite: (id) => set((state) => ({
        websites: state.websites.filter(website => website.id !== id),
        currentWebsite: state.currentWebsite?.id === id ? null : state.currentWebsite
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      fetchWebsites: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/websites");
          const result: WebsitesResponse = await response.json();

          if (result.success && result.data) {
            set({ websites: result.data, isLoading: false });
          } else {
            set({ error: result.error || "Failed to fetch websites", isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch websites",
            isLoading: false
          });
        }
      },

      createWebsite: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/websites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result: WebsiteResponse = await response.json();

          if (result.success && result.data) {
            get().addWebsite(result.data);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to create website", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create website";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      updateWebsiteById: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/websites/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result: WebsiteResponse = await response.json();

          if (result.success && result.data) {
            get().updateWebsite(id, result.data);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to update website", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update website";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      deleteWebsiteById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/websites/${id}`, {
            method: "DELETE",
          });

          const result: WebsiteResponse = await response.json();

          if (result.success) {
            get().removeWebsite(id);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to delete website", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete website";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      getWebsiteById: async (id) => {
        try {
          const response = await fetch(`/api/websites/${id}`);
          const result: WebsiteResponse = await response.json();

          if (result.success && result.data) {
            // content가 string일 경우 JSON.parse를 시도
            const parsedPages = result.data.pages.map(page => {
              if (typeof page.content === 'string') {
                try {
                  return { ...page, content: JSON.parse(page.content) };
                } catch (e) {
                  console.error(`Failed to parse content for page ${page.id}:`, e);
                  // 파싱 실패 시 content를 빈 배열로 설정하여 에러 방지
                  return { ...page, content: [] };
                }
              }
              // content가 이미 객체이거나 다른 타입일 경우 그대로 반환
              return page;
            });
            return { ...result.data, pages: parsedPages };
          }
          return null;
        } catch (error) {
          console.error("Failed to fetch website by id:", error);
          return null;
        }
      },
    }),
    { name: "website-store" }
  )
);