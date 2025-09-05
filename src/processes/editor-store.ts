import { create } from "zustand";
import {
  Element,
  Canvas,
  EditorState,
  GridConfig,
  ElementType,
} from "@/shared/types";

interface EditorStore extends EditorState {
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

  // 드래그 앤 드롭
  moveElement: (id: string, x: number, y: number) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // 히스토리 관리
  saveToHistory: () => void;

  // 그리드 관리
  toggleGrid: () => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  snapToGrid: (x: number, y: number) => { x: number; y: number };
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
  leftPanelVisible: true,
  rightPanelVisible: true,
  canvasZoom: 1,

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
}));
