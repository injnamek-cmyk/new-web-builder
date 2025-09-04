import { create } from "zustand";
import {
  Element,
  Canvas,
  EditorState,
  GridConfig,
  ElementType,
} from "@/shared/types";
import { createElement, generateId } from "@/shared/lib/element-factory";

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
  groupSelectedElements: () => void;
  ungroupElement: (containerId: string) => void;

  // 중첩 요소 관리
  addChildElement: (parentId: string, element: Element) => void;
  getChildElements: (parentId: string) => Element[];
  moveChildElement: (elementId: string, x: number, y: number) => void;
  canHaveChildren: (elementType: ElementType) => boolean;
  calculateElementSize: (elementId: string) => {
    width: number;
    height: number;
  };

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
  selectedElementIds: [],
  width: 1920,
  height: 1080,
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

  groupSelectedElements: () => {
    const state = get();
    const selectedIds = state.canvas.selectedElementIds;

    if (selectedIds.length < 2) {
      console.warn("그룹화하려면 최소 2개 이상의 요소를 선택해야 합니다.");
      return;
    }

    // 선택된 요소들 가져오기 (컨테이너 제외)
    const selectedElements = state.canvas.elements.filter(
      (element) =>
        selectedIds.includes(element.id) && element.type !== "container"
    );

    if (selectedElements.length < 2) {
      console.warn(
        "그룹화하려면 최소 2개 이상의 일반 요소를 선택해야 합니다. (컨테이너 제외)"
      );
      return;
    }

    // 선택된 요소들의 경계 박스 계산
    const minX = Math.min(...selectedElements.map((el) => el.x));
    const minY = Math.min(...selectedElements.map((el) => el.y));
    const maxX = Math.max(
      ...selectedElements.map(
        (el) => el.x + (typeof el.width === "number" ? el.width : 100)
      )
    );
    const maxY = Math.max(
      ...selectedElements.map(
        (el) => el.y + (typeof el.height === "number" ? el.height : 100)
      )
    );

    const containerWidth = maxX - minX;
    const containerHeight = maxY - minY;

    // 컨테이너 생성 (투명한 배경)
    const containerElement = createElement(
      "container",
      generateId(),
      minX,
      minY,
      {
        width: containerWidth,
        height: containerHeight,
        backgroundColor: "transparent",
        borderRadius: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      }
    );

    // 선택된 요소들을 컨테이너의 자식으로 만들기
    const updatedElements = state.canvas.elements.map((element) => {
      if (selectedIds.includes(element.id)) {
        return {
          ...element,
          parentId: containerElement.id,
          x: element.x - minX, // 컨테이너 내부 좌표로 조정
          y: element.y - minY,
        };
      }
      return element;
    });

    set((state) => {
      // 선택된 요소들은 이미 updatedElements에 포함되어 있으므로 추가로 추가하지 않음
      const newElements = [...updatedElements, containerElement];

      return {
        canvas: {
          ...state.canvas,
          elements: newElements,
          selectedElementIds: [containerElement.id],
        },
      };
    });
    get().saveToHistory();
  },

  ungroupElement: (containerId) => {
    const state = get();
    const containerElement = state.canvas.elements.find(
      (el) => el.id === containerId && el.type === "container"
    );

    if (!containerElement) {
      console.warn("컨테이너를 찾을 수 없습니다.");
      return;
    }

    // 컨테이너의 자식 요소들 가져오기
    const childElements = state.canvas.elements.filter(
      (el) => el.parentId === containerId
    );

    if (childElements.length === 0) {
      console.warn("그룹화할 요소가 없습니다.");
      return;
    }

    // 자식 요소들을 컨테이너 밖으로 이동 (절대 좌표로 변환)
    const ungroupedElements = childElements.map((element) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { parentId, ...elementWithoutParentId } = element;
      const newElement = {
        ...elementWithoutParentId,
        x: element.x + containerElement.x,
        y: element.y + containerElement.y,
      };

      return newElement;
    });

    // 컨테이너 제거하고 자식 요소들을 원래 위치로 복원
    set((state) => {
      // 기존 요소들에서 컨테이너와 자식 요소들을 제거
      const elementsWithoutContainerAndChildren = state.canvas.elements.filter(
        (el) => el.id !== containerId && el.parentId !== containerId
      );

      // 새로운 요소 목록 생성
      const newElements = [
        ...elementsWithoutContainerAndChildren,
        ...ungroupedElements,
      ];

      return {
        canvas: {
          ...state.canvas,
          elements: newElements,
          selectedElementIds: ungroupedElements.map((el) => el.id),
        },
      };
    });

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
            selectedElementIds: [],
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

  // 중첩 요소 관리 함수들
  addChildElement: (parentId, element) => {
    const parentElement = get().canvas.elements.find(
      (el) => el.id === parentId
    );
    if (!parentElement) {
      console.error("Parent element not found");
      return;
    }

    // 자식 요소를 가질 수 있는지 확인
    if (!get().canHaveChildren(parentElement.type)) {
      console.error("This element type cannot have children");
      return;
    }

    // 자식 요소의 위치를 부모 요소 내부로 조정
    const parentWidth =
      typeof parentElement.width === "number" ? parentElement.width : 100;
    const parentHeight =
      typeof parentElement.height === "number" ? parentElement.height : 100;
    const elementWidth =
      typeof element.width === "number" ? element.width : 100;
    const elementHeight =
      typeof element.height === "number" ? element.height : 100;

    const childElement = {
      ...element,
      parentId,
      x: Math.max(0, Math.min(element.x, parentWidth - elementWidth)),
      y: Math.max(0, Math.min(element.y, parentHeight - elementHeight)),
    };

    set((state) => {
      // 부모 요소에 자식 ID 추가
      const updatedElements = state.canvas.elements.map((el) => {
        if (el.id === parentId) {
          return {
            ...el,
            children: [...(el.children || []), childElement.id],
          };
        }
        return el;
      });

      return {
        canvas: {
          ...state.canvas,
          elements: [...updatedElements, childElement],
          selectedElementIds: [parentId], // 부모 요소를 계속 선택 상태로 유지
        },
      };
    });
    get().saveToHistory();
  },

  getChildElements: (parentId) => {
    return get().canvas.elements.filter((el) => el.parentId === parentId);
  },

  canHaveChildren: (elementType) => {
    // 이미지 요소는 자식을 가질 수 없음
    return elementType !== "image";
  },

  calculateElementSize: (elementId) => {
    const element = get().canvas.elements.find((el) => el.id === elementId);
    if (!element) return { width: 0, height: 0 };

    // 자동 크기 조정이 비활성화된 경우 기본 크기 반환
    if (!element.autoSize) {
      return {
        width: typeof element.width === "number" ? element.width : 100,
        height: typeof element.height === "number" ? element.height : 100,
      };
    }

    const childElements = get().getChildElements(elementId);

    if (childElements.length === 0) {
      return {
        width: typeof element.width === "number" ? element.width : 100,
        height: typeof element.height === "number" ? element.height : 100,
      };
    }

    // 자식 요소들의 경계 박스 계산
    const minX = Math.min(...childElements.map((el) => el.x));
    const minY = Math.min(...childElements.map((el) => el.y));
    const maxX = Math.max(
      ...childElements.map(
        (el) => el.x + (typeof el.width === "number" ? el.width : 100)
      )
    );
    const maxY = Math.max(
      ...childElements.map(
        (el) => el.y + (typeof el.height === "number" ? el.height : 100)
      )
    );

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const gap = element.gap || 0;

    return {
      width: contentWidth + element.padding.left + element.padding.right + gap,
      height:
        contentHeight + element.padding.top + element.padding.bottom + gap,
    };
  },

  moveChildElement: () => {
    // 자식 요소는 움직이지 못하도록 비활성화
    return;
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
