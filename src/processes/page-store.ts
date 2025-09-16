import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Page, CreatePageRequest, UpdatePageRequest, PageResponse } from "@/shared/types";

interface PageState {
  pages: Page[];
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
  addPage: (page: Page) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  removePage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API calls
  fetchPages: () => Promise<void>;
  createPage: (data: CreatePageRequest) => Promise<PageResponse>;
  updatePageById: (id: string, data: UpdatePageRequest) => Promise<PageResponse>;
  deletePageById: (id: string) => Promise<PageResponse>;
  getPageByPath: (path: string) => Promise<Page | null>;
}

export const usePageStore = create<PageState>()(
  devtools(
    (set, get) => ({
      pages: [],
      currentPage: null,
      isLoading: false,
      error: null,

      setPages: (pages) => set({ pages }),

      setCurrentPage: (page) => set({ currentPage: page }),

      addPage: (page) => set((state) => ({
        pages: [page, ...state.pages]
      })),

      updatePage: (id, updates) => set((state) => ({
        pages: state.pages.map(page =>
          page.id === id ? { ...page, ...updates } : page
        ),
        currentPage: state.currentPage?.id === id
          ? { ...state.currentPage, ...updates }
          : state.currentPage
      })),

      removePage: (id) => set((state) => ({
        pages: state.pages.filter(page => page.id !== id),
        currentPage: state.currentPage?.id === id ? null : state.currentPage
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      fetchPages: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/pages");
          const result = await response.json();

          if (result.success) {
            set({ pages: result.data, isLoading: false });
          } else {
            set({ error: result.error, isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch pages",
            isLoading: false
          });
        }
      },

      createPage: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/pages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result: PageResponse = await response.json();

          if (result.success && result.data) {
            get().addPage(result.data);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to create page", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create page";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      updatePageById: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/pages/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result: PageResponse = await response.json();

          if (result.success && result.data) {
            get().updatePage(id, result.data);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to update page", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update page";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      deletePageById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/pages/${id}`, {
            method: "DELETE",
          });

          const result: PageResponse = await response.json();

          if (result.success) {
            get().removePage(id);
            set({ isLoading: false });
          } else {
            set({ error: result.error || "Failed to delete page", isLoading: false });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete page";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      getPageByPath: async (path) => {
        try {
          const response = await fetch(`/api/pages/path${path}`);
          const result = await response.json();

          if (result.success) {
            return result.data;
          }
          return null;
        } catch (error) {
          console.error("Failed to fetch page by path:", error);
          return null;
        }
      },
    }),
    { name: "page-store" }
  )
);