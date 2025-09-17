import { create } from "zustand";
import {
  Element,
  Canvas,
  EditorState,
  GridConfig,
  ContainerElement,
} from "@/shared/types";
import type { 
  CreatePageRequest, 
  UpdatePageRequest 
} from "@/lib/api/pages";

interface EditorStore extends EditorState {
  // 페이지 관리
  currentPageId: string | null;
  currentPageTitle: string;
  currentWebsiteId: string | null;
  isSaving: boolean;
  // UI 상태
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  canvasZoom: number;

  // UI 조작
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setCanvasZoom: (zoom: number) => void;
  resetCanvasZoom: () => void;

  // 캔버스 조작
  setCanvas: (canvas: Canvas) => void;
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;

  // 다중 선택 관리
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
  isSelected: (id: string) => boolean;

  // 다중 요소 조작
  moveSelectedElements: (deltaX: number, deltaY: number) => void;
  deleteSelectedElements: () => void;

  // 컨테이너 자식 관리 (하이브리드 레이아웃)
  addChildToContainer: (containerId: string, childId: string) => void;
  removeChildFromContainer: (containerId: string, childId: string) => void;
  moveChildInContainer: (containerId: string, childId: string, targetIndex: number) => void;
  setContainerLayoutMode: (containerId: string, layoutMode: "absolute" | "flex" | "grid" | "flow") => void;
  updateContainerLayout: (containerId: string, layoutProps: Partial<ContainerElement>) => void;

  // 드래그 앤 드롭
  moveElement: (id: string, x: number, y: number) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // 리사이즈 관리
  resizeElement: (id: string, width: number, height: number) => void;
  resizeAndMoveElement: (id: string, x: number, y: number, width: number, height: number) => void;
  resizeSelectedElements: (deltaWidth: number, deltaHeight: number) => void;

  // 히스토리 관리
  saveToHistory: () => void;

  // 그리드 관리
  toggleGrid: () => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  snapToGrid: (x: number, y: number) => { x: number; y: number };

  // 페이지 관리
  setCurrentPage: (pageId: string | null, title?: string) => void;
  setCurrentPageTitle: (title: string) => void;
  savePage: (title?: string) => Promise<string | null>;
  loadPage: (pageId: string) => Promise<void>;
  createNewPage: (title?: string) => Promise<string | null>;
  getPreviewUrl: () => string | null;

  // 페이지 데이터로 에디터 상태를 초기화하는 함수
  initializeEditor: (pageId: string, title: string, canvas: Canvas, websiteId?: string) => void;
}

const initialCanvas: Canvas = {
  elements: [],
  selectedElementIds: [],
  width: 1920,
  height: 1080,
};

const initialGrid: GridConfig = {
  showGrid: false,
  columns: 24,
  rows: 20,
  cellSize: 80, // 1920px / 24 = 80px
  snapToGrid: true,
};

const initialHistory: Canvas[] = [initialCanvas];

export const useEditorStore = create<EditorStore>((set, get) => ({
  canvas: initialCanvas,
  history: initialHistory,
  historyIndex: 0,
  isDragging: false,
  isResizing: false,
  grid: initialGrid,
  currentPageId: null,
  currentPageTitle: "새 페이지",
  currentWebsiteId: null,
  isSaving: false,
  leftPanelVisible: true,
  rightPanelVisible: true,
  canvasZoom: 1,


  // setCanvas method
  setCanvas: (canvas) => {
    set({ canvas });
    get().saveToHistory();
  },

  addElement: (element) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: [...state.canvas.elements, element],
        selectedElementIds: [element.id],
      },
    }));
    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          element.id === id ? ({ ...element, ...updates } as Element) : element
        ),
      },
    }));
  },

  deleteElement: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.filter((element) => element.id !== id),
        selectedElementIds: state.canvas.selectedElementIds.filter(
          (selectedId) => selectedId !== id
        ),
      },
    }));
    get().saveToHistory();
  },

  selectElement: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementIds: id ? [id] : [],
      },
    }));
  },

  moveElement: (id, x, y) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          element.id === id ? { ...element, x, y } : element
        ),
      },
    }));
  },

  // 다중 선택 관리 함수들
  addToSelection: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementIds: state.canvas.selectedElementIds.includes(id)
          ? state.canvas.selectedElementIds
          : [...state.canvas.selectedElementIds, id],
      },
    }));
  },

  removeFromSelection: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementIds: state.canvas.selectedElementIds.filter(
          (selectedId) => selectedId !== id
        ),
      },
    }));
  },

  toggleSelection: (id) => {
    set((state) => {
      const isSelected = state.canvas.selectedElementIds.includes(id);
      return {
        canvas: {
          ...state.canvas,
          selectedElementIds: isSelected
            ? state.canvas.selectedElementIds.filter(
                (selectedId) => selectedId !== id
              )
            : [...state.canvas.selectedElementIds, id],
        },
      };
    });
  },

  clearSelection: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementIds: [],
      },
    }));
  },

  selectMultiple: (ids) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementIds: ids,
      },
    }));
  },

  isSelected: (id) => {
    return get().canvas.selectedElementIds.includes(id);
  },

  // 다중 요소 조작 함수들
  moveSelectedElements: (deltaX, deltaY) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          state.canvas.selectedElementIds.includes(element.id)
            ? { ...element, x: element.x + deltaX, y: element.y + deltaY }
            : element
        ),
      },
    }));
  },

  deleteSelectedElements: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.filter(
          (element) => !state.canvas.selectedElementIds.includes(element.id)
        ),
        selectedElementIds: [],
      },
    }));
    get().saveToHistory();
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },

  setResizing: (isResizing) => {
    set({ isResizing });
  },

  resizeElement: (id, width, height) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          element.id === id ? { ...element, width, height } : element
        ),
      },
    }));
  },

  resizeAndMoveElement: (id, x, y, width, height) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          element.id === id ? { ...element, x, y, width, height } : element
        ),
      },
    }));
  },

  resizeSelectedElements: (deltaWidth, deltaHeight) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) => {
          if (state.canvas.selectedElementIds.includes(element.id)) {
            const currentWidth = typeof element.width === "number" ? element.width : 100;
            const currentHeight = typeof element.height === "number" ? element.height : 100;
            return {
              ...element,
              width: Math.max(10, currentWidth + deltaWidth),
              height: Math.max(10, currentHeight + deltaHeight),
            };
          }
          return element;
        }),
      },
    }));
  },

  saveToHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ ...state.canvas });
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  toggleGrid: () => {
    set((state) => ({
      grid: {
        ...state.grid,
        showGrid: !state.grid.showGrid,
      },
    }));
  },

  setGridConfig: (config) => {
    set((state) => ({
      grid: {
        ...state.grid,
        ...config,
      },
    }));
  },

  snapToGrid: (x, y) => {
    const { grid } = get();
    if (!grid.snapToGrid) return { x, y };

    const cellSize = grid.cellSize;

    // 요소의 왼쪽 위 모서리를 기준으로 그리드에 스냅
    return {
      x: Math.round(x / cellSize) * cellSize,
      y: Math.round(y / cellSize) * cellSize,
    };
  },

  // UI 조작 함수들
  toggleLeftPanel: () => {
    set((state) => ({
      leftPanelVisible: !state.leftPanelVisible,
    }));
  },

  toggleRightPanel: () => {
    set((state) => ({
      rightPanelVisible: !state.rightPanelVisible,
    }));
  },

  setCanvasZoom: (zoom) => {
    set({ canvasZoom: Math.max(0.1, Math.min(3, zoom)) });
  },

  resetCanvasZoom: () => {
    set({ canvasZoom: 1 });
  },

  initializeEditor: (pageId, title, canvas, websiteId) => {
    set({
      currentPageId: pageId,
      currentPageTitle: title,
      currentWebsiteId: websiteId || null,
      canvas: canvas,
      history: [canvas],
      historyIndex: 0,
    });
  },

  // 페이지 관리 함수들
  setCurrentPage: (pageId, title) => {
    set({
      currentPageId: pageId,
      currentPageTitle: title || "새 페이지",
    });
  },

  setCurrentPageTitle: (title) => {
    set({ currentPageTitle: title });
  },

  savePage: async (title) => {
    const state = get();
    const pageTitle = title || state.currentPageTitle;
    
    set({ isSaving: true });

    try {
      if (state.currentPageId) {
        // 기존 페이지 업데이트
        const updateData: UpdatePageRequest = {
          title: pageTitle,
          canvas: state.canvas,
        };

        const response = await fetch(`/api/pages/${state.currentPageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error("Failed to update page");
        }

        set({ currentPageTitle: pageTitle });
        return state.currentPageId;
      } else {
        // 새 페이지 생성
        const createData: CreatePageRequest = {
          title: pageTitle,
          canvas: state.canvas,
        };

        const response = await fetch("/api/pages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        });

        if (!response.ok) {
          throw new Error("Failed to create page");
        }

        const result = await response.json();
        set({
          currentPageId: result.page.id,
          currentPageTitle: pageTitle,
        });
        return result.page.id;
      }
    } catch (error) {
      console.error("Failed to save page:", error);
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  loadPage: async (pageId) => {
    // TODO: 로딩 상태를 관리하는 별도 state(e.g. isLoading)를 사용하는 것이 좋습니다.
    set({ isSaving: true });

    try {
      const response = await fetch(`/api/pages/${pageId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.statusText}`);
      }

      const result = await response.json();
      const pageData = result.page;

      // content가 JSON 객체이므로, 여기서 title과 canvas를 추출해야 합니다.
      if (pageData && pageData.content && typeof pageData.content === 'object') {
        const { title, canvas } = pageData.content as { title: string; canvas: Canvas };
        
        // 로드된 캔버스에 selectedElementIds가 없으면 빈 배열로 초기화
        const safeCanvas = {
          ...canvas,
          selectedElementIds: canvas.selectedElementIds || [],
        };
        
        set({
          currentPageId: pageData.id,
          currentPageTitle: title || "제목 없음",
          canvas: safeCanvas,
          history: [safeCanvas],
          historyIndex: 0,
        });
      } else {
        throw new Error("Invalid page data format");
      }
    } catch (error) {
      console.error("Failed to load page:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  createNewPage: async (title) => {
    const pageTitle = title || "새 페이지";

    set({
      canvas: initialCanvas,
      history: [initialCanvas],
      historyIndex: 0,
      currentPageId: null,
      currentPageTitle: pageTitle,
    });

    return get().savePage(pageTitle);
  },

  getPreviewUrl: () => {
    const state = get();
    if (!state.currentWebsiteId) {
      return null;
    }
    return `/preview/${state.currentWebsiteId}`;
  },

  // 컨테이너 자식 관리 함수들 (하이브리드 레이아웃)
  addChildToContainer: (containerId, childId) => {
    set((state) => {
      const elements = state.canvas.elements.map((element) => {
        if (element.id === containerId && element.type === "container") {
          const container = element as ContainerElement;
          const children = container.children || [];
          
          // 이미 자식으로 있다면 추가하지 않음
          if (children.includes(childId)) {
            return element;
          }
          
          return {
            ...container,
            children: [...children, childId],
          };
        }
        return element;
      });
      
      return {
        canvas: {
          ...state.canvas,
          elements,
        },
      };
    });
    get().saveToHistory();
  },

  removeChildFromContainer: (containerId, childId) => {
    set((state) => {
      // 1. 컨테이너에서 자식 관계 제거
      const elements = state.canvas.elements.map((element) => {
        if (element.id === containerId && element.type === "container") {
          const container = element as ContainerElement;
          const children = container.children || [];
          
          return {
            ...container,
            children: children.filter(id => id !== childId),
          };
        }
        return element;
      })
      // 2. 캔버스에서 해당 요소 완전 삭제
      .filter(element => element.id !== childId);
      
      // 3. 선택된 요소가 삭제된 요소라면 선택 해제
      const selectedElementIds = state.canvas.selectedElementIds.filter(id => id !== childId);
      
      return {
        canvas: {
          ...state.canvas,
          elements,
          selectedElementIds,
        },
      };
    });
    get().saveToHistory();
  },

  moveChildInContainer: (containerId, childId, targetIndex) => {
    set((state) => {
      const elements = state.canvas.elements.map((element) => {
        if (element.id === containerId && element.type === "container") {
          const container = element as ContainerElement;
          const children = container.children || [];
          
          const currentIndex = children.indexOf(childId);
          if (currentIndex === -1) return element;
          
          const newChildren = [...children];
          newChildren.splice(currentIndex, 1);
          newChildren.splice(targetIndex, 0, childId);
          
          return {
            ...container,
            children: newChildren,
          };
        }
        return element;
      });
      
      return {
        canvas: {
          ...state.canvas,
          elements,
        },
      };
    });
    get().saveToHistory();
  },

  setContainerLayoutMode: (containerId, layoutMode) => {
    set((state) => {
      const elements = state.canvas.elements.map((element) => {
        if (element.id === containerId && element.type === "container") {
          return {
            ...element,
            layoutMode,
          } as ContainerElement;
        }
        return element;
      });
      
      return {
        canvas: {
          ...state.canvas,
          elements,
        },
      };
    });
    get().saveToHistory();
  },

  updateContainerLayout: (containerId, layoutProps) => {
    set((state) => {
      const elements = state.canvas.elements.map((element) => {
        if (element.id === containerId && element.type === "container") {
          const container = element as ContainerElement;
          return {
            ...container,
            ...layoutProps,
          };
        }
        return element;
      });
      
      return {
        canvas: {
          ...state.canvas,
          elements,
        },
      };
    });
    get().saveToHistory();
  },
}));
