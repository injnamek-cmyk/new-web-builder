import { NextRequest, NextResponse } from "next/server";
import { getMemoryStore } from "@/shared/lib/memory-store";
import { LayoutOptimizer } from "@/shared/lib/layout-optimizer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 향상된 렌더링을 위한 페이지 데이터 조회
 * - 반응형 레이아웃 지원
 * - 성능 최적화된 구조
 * - 레이아웃 분석 포함
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터
    const includeAnalysis = searchParams.get('analysis') === 'true';
    const migrate = searchParams.get('migrate') === 'true';
    const viewport = {
      width: parseInt(searchParams.get('viewport_width') || '1920'),
      height: parseInt(searchParams.get('viewport_height') || '1080')
    };

    const store = getMemoryStore();
    const page = store.getPage(id);

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    let response: any = {
      pageId: page.id,
      title: page.title,
      viewport,
      metadata: {
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        version: "1.0.0"
      }
    };

    if (migrate) {
      // 향상된 캔버스로 마이그레이션
      const { enhancedCanvas, mappings } = LayoutOptimizer.migrateToEnhancedCanvas(page.canvas);
      
      response.canvas = enhancedCanvas;
      response.migration = {
        mappings,
        timestamp: new Date(),
        fromVersion: "legacy",
        toVersion: "enhanced"
      };
    } else {
      // 기존 구조 유지
      response.canvas = {
        width: page.canvas.width,
        height: page.canvas.height,
        elements: page.canvas.elements.map(element => ({
          id: element.id,
          type: element.type,
          position: {
            x: element.x,
            y: element.y
          },
          size: {
            width: element.width,
            height: element.height
          },
          zIndex: element.zIndex,
          style: extractElementStyle(element),
          props: extractElementProps(element),
        }))
      };
    }

    if (includeAnalysis) {
      // 레이아웃 분석 포함
      const analysis = LayoutOptimizer.analyzeCanvas(page.canvas);
      response.analysis = analysis;
    }

    // 성능 헤더 추가
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Performance-Mode': migrate ? 'enhanced' : 'legacy'
    });

    return new NextResponse(JSON.stringify({ data: response }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Failed to fetch enhanced render data:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch render data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * 성능 최적화를 위한 캐시 무효화
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // 향후 Redis 또는 다른 캐시 시스템과 연동
    console.log(`Invalidating cache for page: ${id}`);
    
    return NextResponse.json(
      { message: "Cache invalidated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to invalidate cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}

// 요소의 스타일 정보 추출 (기존 함수 재사용)
function extractElementStyle(element: any) {
  const style: any = {
    padding: element.padding,
  };

  switch (element.type) {
    case "text":
      return {
        ...style,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        textAlign: element.textAlign,
        fontWeight: element.fontWeight,
        textDecoration: element.textDecoration,
        lineHeight: element.lineHeight,
      };
    
    case "image":
      return {
        ...style,
        objectFit: element.objectFit,
        objectPosition: element.objectPosition,
        filter: element.filter,
      };
    
    case "button":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        textColor: element.textColor,
        borderRadius: element.borderRadius,
      };
    
    case "container":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        borderRadius: element.borderRadius,
        borderStyle: element.borderStyle,
        borderWidth: element.borderWidth,
        borderColor: element.borderColor,
        boxShadow: element.boxShadow,
      };
    
    default:
      return style;
  }
}

// 요소의 속성 정보 추출 (기존 함수 재사용)
function extractElementProps(element: any) {
  switch (element.type) {
    case "text":
      return {
        content: element.content,
      };
    
    case "image":
      return {
        src: element.src,
        alt: element.alt,
      };
    
    case "button":
      return {
        text: element.text,
        href: element.href,
        variant: element.variant,
        size: element.size,
        icon: element.icon,
        iconPosition: element.iconPosition,
      };
    
    case "accordion":
      return {
        items: element.items,
        variant: element.variant,
        collapsible: element.collapsible,
        accordionType: element.accordionType,
        disabled: element.disabled,
      };
    
    case "calendar":
      return {
        mode: element.mode,
        selectedDate: element.selectedDate,
        selectedDates: element.selectedDates,
        showOutsideDays: element.showOutsideDays,
        disabled: element.disabled,
        defaultMonth: element.defaultMonth,
        fixedWeeks: element.fixedWeeks,
        weekStartsOn: element.weekStartsOn,
      };
    
    default:
      return {};
  }
}