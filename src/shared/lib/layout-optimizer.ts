import { 
  Canvas, 
  Element, 
  BaseElement 
} from "@/shared/types";
import { 
  EnhancedCanvas, 
  LayoutContainer, 
  EnhancedRenderElement,
  LayoutAnalysis,
  MigrationMapping,
  ResponsiveBreakpoint 
} from "@/shared/types/enhanced-server-driven-ui";

/**
 * 레이아웃 최적화 및 분석 서비스
 */
export class LayoutOptimizer {
  private static readonly DEFAULT_BREAKPOINTS: ResponsiveBreakpoint[] = [
    { name: "mobile", minWidth: 0, maxWidth: 768 },
    { name: "tablet", minWidth: 769, maxWidth: 1024 },
    { name: "desktop", minWidth: 1025, maxWidth: 1440 },
    { name: "wide", minWidth: 1441 }
  ];

  /**
   * 기존 캔버스를 분석하여 최적화 권장사항 제공
   */
  static analyzeCanvas(canvas: Canvas): LayoutAnalysis {
    const elements = canvas.elements;
    const totalElements = elements.length;
    
    // 레이아웃 모드별 분석
    const layoutModes = this.analyzeLayoutPatterns(elements);
    
    // 복잡도 분석
    const complexity = this.calculateComplexity(elements);
    
    // 성능 분석
    const performance = this.analyzePerformance(elements, canvas);
    
    // 권장사항 생성
    const recommendations = this.generateRecommendations(elements, layoutModes, complexity);

    return {
      totalElements,
      layoutModes,
      complexity,
      performance,
      recommendations
    };
  }

  /**
   * 기존 캔버스를 향상된 캔버스로 마이그레이션
   */
  static migrateToEnhancedCanvas(canvas: Canvas): {
    enhancedCanvas: EnhancedCanvas;
    mappings: MigrationMapping[];
  } {
    const mappings: MigrationMapping[] = [];
    
    // 요소들을 그룹화하여 컨테이너 구조 생성
    const groupedElements = this.groupElementsByLayout(canvas.elements);
    
    // 루트 컨테이너 생성
    const root = this.createRootContainer(groupedElements, canvas, mappings);
    
    const enhancedCanvas: EnhancedCanvas = {
      baseWidth: canvas.width,
      baseHeight: canvas.height,
      breakpoints: this.DEFAULT_BREAKPOINTS,
      root,
      globalStyles: {
        fonts: ["Inter", "system-ui", "sans-serif"],
        customCSS: this.generateGlobalCSS()
      }
    };

    return { enhancedCanvas, mappings };
  }

  /**
   * 요소들의 레이아웃 패턴 분석
   */
  private static analyzeLayoutPatterns(elements: Element[]) {
    const patterns = {
      absolute: 0,
      flex: 0,
      grid: 0,
      flow: 0
    };

    // 현재는 모든 요소가 절대 포지셔닝
    patterns.absolute = elements.length;

    // 향후 머신러닝 기반 패턴 인식으로 확장 가능
    // - 수평/수직 정렬 패턴 감지
    // - 그리드 패턴 감지
    // - 플로우 레이아웃 패턴 감지

    return patterns;
  }

  /**
   * 복잡도 계산
   */
  private static calculateComplexity(elements: Element[]): "simple" | "moderate" | "complex" {
    const elementCount = elements.length;
    const zIndexLayers = new Set(elements.map(el => el.zIndex)).size;
    const overlappingElements = this.countOverlappingElements(elements);

    const complexityScore = 
      elementCount * 0.1 + 
      zIndexLayers * 0.2 + 
      overlappingElements * 0.3;

    if (complexityScore < 5) return "simple";
    if (complexityScore < 15) return "moderate";
    return "complex";
  }

  /**
   * 성능 분석
   */
  private static analyzePerformance(elements: Element[], canvas: Canvas) {
    const estimatedDOMNodes = elements.length * 2; // 평균적으로 요소당 2개 DOM 노드
    const renderingComplexity = this.calculateRenderingComplexity(elements);
    const responsiveComplexity = 1; // 현재는 반응형 미지원

    return {
      estimatedDOMNodes,
      renderingComplexity,
      responsiveComplexity
    };
  }

  /**
   * 렌더링 복잡도 계산
   */
  private static calculateRenderingComplexity(elements: Element[]): number {
    let complexity = 0;
    
    elements.forEach(element => {
      // 기본 복잡도
      complexity += 1;
      
      // 타입별 추가 복잡도
      switch (element.type) {
        case "image":
          complexity += 2; // 이미지 로딩 및 최적화
          break;
        case "accordion":
          complexity += 3; // 동적 상호작용
          break;
        case "calendar":
          complexity += 4; // 복잡한 상태 관리
          break;
      }
      
      // z-index로 인한 레이어 복잡도
      complexity += element.zIndex * 0.1;
    });

    return Math.round(complexity);
  }

  /**
   * 겹치는 요소 개수 계산
   */
  private static countOverlappingElements(elements: Element[]): number {
    let overlapping = 0;
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (this.elementsOverlap(elements[i], elements[j])) {
          overlapping++;
        }
      }
    }
    
    return overlapping;
  }

  /**
   * 두 요소가 겹치는지 확인
   */
  private static elementsOverlap(el1: Element, el2: Element): boolean {
    const el1Right = el1.x + (typeof el1.width === 'number' ? el1.width : 100);
    const el1Bottom = el1.y + (typeof el1.height === 'number' ? el1.height : 100);
    const el2Right = el2.x + (typeof el2.width === 'number' ? el2.width : 100);
    const el2Bottom = el2.y + (typeof el2.height === 'number' ? el2.height : 100);

    return !(el1Right <= el2.x || el2Right <= el1.x || el1Bottom <= el2.y || el2Bottom <= el1.y);
  }

  /**
   * 권장사항 생성
   */
  private static generateRecommendations(
    elements: Element[], 
    layoutModes: any, 
    complexity: string
  ): string[] {
    const recommendations: string[] = [];

    // 절대 포지셔닝 관련 권장사항
    if (layoutModes.absolute > 5) {
      recommendations.push("많은 절대 포지션 요소를 Flexbox 또는 Grid 레이아웃으로 변환하여 반응형 지원과 성능을 개선하세요.");
    }

    // 복잡도 관련 권장사항
    if (complexity === "complex") {
      recommendations.push("레이아웃 복잡도가 높습니다. 컨테이너를 활용한 계층 구조로 단순화를 고려하세요.");
    }

    // 반응형 관련 권장사항
    recommendations.push("모바일 및 태블릿 지원을 위해 반응형 레이아웃으로 전환하세요.");

    // 성능 관련 권장사항
    if (elements.length > 20) {
      recommendations.push("많은 요소로 인해 성능 저하가 예상됩니다. 가상화 또는 지연 로딩을 고려하세요.");
    }

    // 접근성 관련 권장사항
    recommendations.push("시맨틱 HTML 구조와 키보드 내비게이션 지원을 위해 레이아웃 컨테이너를 활용하세요.");

    return recommendations;
  }

  /**
   * 요소들을 레이아웃별로 그룹화
   */
  private static groupElementsByLayout(elements: Element[]): LayoutGroup[] {
    // 간단한 그룹화 로직 - 향후 머신러닝으로 개선 가능
    const groups: LayoutGroup[] = [];
    
    // Y 위치를 기준으로 행 단위 그룹화
    const rows = this.groupElementsByRows(elements);
    
    rows.forEach((rowElements, index) => {
      // 각 행에서 X 위치를 기준으로 정렬
      const sortedElements = rowElements.sort((a, b) => a.x - b.x);
      
      groups.push({
        id: `row-${index}`,
        elements: sortedElements,
        suggestedLayout: this.suggestLayoutForGroup(sortedElements),
        bounds: this.calculateGroupBounds(sortedElements)
      });
    });

    return groups;
  }

  /**
   * 요소들을 행별로 그룹화
   */
  private static groupElementsByRows(elements: Element[]): Element[][] {
    const rows: Element[][] = [];
    const tolerance = 50; // Y 위치 허용 오차

    elements.forEach(element => {
      let placed = false;
      
      for (const row of rows) {
        const rowY = row[0].y;
        if (Math.abs(element.y - rowY) <= tolerance) {
          row.push(element);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        rows.push([element]);
      }
    });

    return rows.sort((a, b) => a[0].y - b[0].y);
  }

  /**
   * 그룹에 적합한 레이아웃 제안
   */
  private static suggestLayoutForGroup(elements: Element[]): "flex" | "grid" | "absolute" {
    if (elements.length === 1) return "absolute";
    
    // 수평 정렬된 요소들은 flex가 적합
    const isHorizontallyAligned = this.checkHorizontalAlignment(elements);
    if (isHorizontallyAligned) return "flex";
    
    // 격자 패턴은 grid가 적합
    const isGridPattern = this.checkGridPattern(elements);
    if (isGridPattern) return "grid";
    
    return "absolute"; // 기본값
  }

  /**
   * 수평 정렬 확인
   */
  private static checkHorizontalAlignment(elements: Element[]): boolean {
    if (elements.length < 2) return false;
    
    const tolerance = 20;
    const firstY = elements[0].y;
    
    return elements.every(el => Math.abs(el.y - firstY) <= tolerance);
  }

  /**
   * 그리드 패턴 확인
   */
  private static checkGridPattern(elements: Element[]): boolean {
    // 간단한 그리드 패턴 감지 로직
    return elements.length >= 4 && elements.length % 2 === 0;
  }

  /**
   * 그룹 경계 계산
   */
  private static calculateGroupBounds(elements: Element[]) {
    const minX = Math.min(...elements.map(el => el.x));
    const minY = Math.min(...elements.map(el => el.y));
    const maxX = Math.max(...elements.map(el => el.x + (typeof el.width === 'number' ? el.width : 100)));
    const maxY = Math.max(...elements.map(el => el.y + (typeof el.height === 'number' ? el.height : 100)));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 루트 컨테이너 생성
   */
  private static createRootContainer(
    groups: LayoutGroup[], 
    canvas: Canvas, 
    mappings: MigrationMapping[]
  ): LayoutContainer {
    const children: (LayoutContainer | EnhancedRenderElement)[] = [];

    groups.forEach((group, index) => {
      if (group.suggestedLayout === "flex" || group.suggestedLayout === "grid") {
        // 컨테이너로 그룹화
        const container = this.createGroupContainer(group, index, mappings);
        children.push(container);
      } else {
        // 개별 요소로 추가
        group.elements.forEach(element => {
          const enhancedElement = this.convertToEnhancedElement(element, mappings);
          children.push(enhancedElement);
        });
      }
    });

    return {
      id: "root",
      type: "layout-container",
      position: {
        mode: "flow",
        flow: {
          display: "block",
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
      },
      size: {
        width: canvas.width,
        height: canvas.height
      },
      children,
      style: {
        backgroundColor: "#ffffff"
      }
    };
  }

  /**
   * 그룹 컨테이너 생성
   */
  private static createGroupContainer(
    group: LayoutGroup, 
    index: number, 
    mappings: MigrationMapping[]
  ): LayoutContainer {
    const children = group.elements.map(element => 
      this.convertToEnhancedElement(element, mappings, ["container", `group-${index}`])
    );

    return {
      id: `container-${index}`,
      type: "layout-container",
      position: {
        mode: group.suggestedLayout,
        ...(group.suggestedLayout === "flex" ? {
          flex: {
            direction: "row",
            justify: "flex-start",
            align: "flex-start",
            wrap: "nowrap",
            gap: 16
          }
        } : {
          grid: {
            templateColumns: `repeat(${Math.ceil(Math.sqrt(group.elements.length))}, 1fr)`,
            templateRows: "auto",
            gap: { row: 16, column: 16 }
          }
        })
      },
      size: {
        width: group.bounds.width,
        height: group.bounds.height
      },
      children,
      style: {}
    };
  }

  /**
   * 요소를 향상된 요소로 변환
   */
  private static convertToEnhancedElement(
    element: Element, 
    mappings: MigrationMapping[],
    containerPath: string[] = ["root"]
  ): EnhancedRenderElement {
    // 마이그레이션 매핑 기록
    mappings.push({
      legacyElementId: element.id,
      newContainerPath: containerPath,
      conversionStrategy: "absolute-to-flex", // 기본값
      confidenceScore: 0.8
    });

    return {
      id: element.id,
      type: element.type,
      position: {
        mode: "absolute", // 초기에는 절대 포지션 유지
        absolute: {
          x: element.x,
          y: element.y,
          zIndex: element.zIndex
        }
      },
      size: {
        width: element.width,
        height: element.height
      },
      style: this.extractElementStyles(element),
      props: this.extractElementProps(element)
    };
  }

  /**
   * 요소 스타일 추출
   */
  private static extractElementStyles(element: Element): Record<string, any> {
    const baseStyles = {
      padding: element.padding
    };

    switch (element.type) {
      case "text":
        const textEl = element as any;
        return {
          ...baseStyles,
          fontSize: textEl.fontSize,
          fontFamily: textEl.fontFamily,
          color: textEl.color,
          textAlign: textEl.textAlign,
          fontWeight: textEl.fontWeight,
          textDecoration: textEl.textDecoration,
          lineHeight: textEl.lineHeight
        };
      // 다른 타입들도 동일하게 처리...
      default:
        return baseStyles;
    }
  }

  /**
   * 요소 속성 추출
   */
  private static extractElementProps(element: Element): Record<string, any> {
    switch (element.type) {
      case "text":
        const textEl = element as any;
        return { content: textEl.content };
      // 다른 타입들도 동일하게 처리...
      default:
        return {};
    }
  }

  /**
   * 전역 CSS 생성
   */
  private static generateGlobalCSS(): string {
    return `
      /* 향상된 서버 드리븐 UI 전역 스타일 */
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      /* 반응형 유틸리티 */
      @media (max-width: 768px) {
        .hide-mobile { display: none !important; }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .hide-tablet { display: none !important; }
      }
      
      @media (min-width: 1025px) {
        .hide-desktop { display: none !important; }
      }
      
      /* 성능 최적화 */
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* 접근성 개선 */
      :focus-visible {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
    `;
  }
}

// 내부 타입 정의
interface LayoutGroup {
  id: string;
  elements: Element[];
  suggestedLayout: "flex" | "grid" | "absolute";
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}