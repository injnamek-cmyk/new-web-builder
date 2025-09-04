import { create } from "zustand";
import { Element, Canvas, EditorState, GridConfig } from "@/shared/types";

interface EditorStore extends EditorState {
  // 캔버스 조작
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;

  // 드래그 앤 드롭
  moveElement: (id: string, x: number, y: number) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // 히스토리 관리
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // 로컬 저장소
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  // 캔버스 초기화
  clearCanvas: () => void;

  // 그리드 관리
  toggleGrid: () => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  snapToGrid: (x: number, y: number) => { x: number; y: number };
}

const initialCanvas: Canvas = {
  elements: [],
  selectedElementId: null,
  width: 1200,
  height: 800,
};

const initialGrid: GridConfig = {
  showGrid: false,
  columns: 24,
  rows: 20,
  cellSize: 50, // 1200px / 24 = 50px
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

  addElement: (element) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: [...state.canvas.elements, element],
        selectedElementId: element.id,
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
        selectedElementId:
          state.canvas.selectedElementId === id
            ? null
            : state.canvas.selectedElementId,
      },
    }));
    get().saveToHistory();
  },

  selectElement: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedElementId: id,
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

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          canvas: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          canvas: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    });
  },

  saveToLocalStorage: () => {
    const state = get();
    localStorage.setItem("web-builder-canvas", JSON.stringify(state.canvas));
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem("web-builder-canvas");
    if (saved) {
      try {
        const canvas = JSON.parse(saved);
        set({
          canvas: {
            ...canvas,
            selectedElementId: null,
          },
        });
        get().saveToHistory();
      } catch (error) {
        console.error("Failed to load from localStorage:", error);
      }
    }
  },

  clearCanvas: () => {
    set({
      canvas: initialCanvas,
      history: initialHistory,
      historyIndex: 0,
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
}));
