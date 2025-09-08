import { NextRequest, NextResponse } from "next/server";
import { getMemoryStore } from "@/shared/lib/memory-store";
import { LayoutOptimizer } from "@/shared/lib/layout-optimizer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 레이아웃 분석 API
 * - 현재 레이아웃의 성능 및 복잡도 분석
 * - 최적화 권장사항 제공
 * - 마이그레이션 계획 수립 지원
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // 분석 옵션
    const includeRecommendations = searchParams.get('recommendations') !== 'false';
    const includeMigrationPlan = searchParams.get('migration') === 'true';
    const performanceOnly = searchParams.get('performance_only') === 'true';

    const store = getMemoryStore();
    const page = store.getPage(id);

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // 기본 분석
    const analysis = LayoutOptimizer.analyzeCanvas(page.canvas);
    
    let response: any = {
      pageId: page.id,
      analysis,
      timestamp: new Date()
    };

    if (performanceOnly) {
      // 성능 메트릭만 반환
      response = {
        pageId: page.id,
        performance: analysis.performance,
        complexity: analysis.complexity,
        totalElements: analysis.totalElements,
        timestamp: new Date()
      };
    }

    if (includeMigrationPlan && !performanceOnly) {
      // 마이그레이션 계획 생성
      const { mappings } = LayoutOptimizer.migrateToEnhancedCanvas(page.canvas);
      
      response.migrationPlan = {
        totalElements: analysis.totalElements,
        conversionStrategies: aggregateConversionStrategies(mappings),
        estimatedEffort: calculateMigrationEffort(analysis, mappings),
        phases: generateMigrationPhases(mappings),
        riskAssessment: assessMigrationRisk(analysis, mappings)
      };
    }

    if (!includeRecommendations) {
      delete response.analysis?.recommendations;
    }

    // 성능 헤더
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'X-Analysis-Version': '1.0.0'
    });

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Failed to analyze layout:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze layout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * 레이아웃 비교 분석
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { compareWithPageId } = body;

    if (!compareWithPageId) {
      return NextResponse.json(
        { error: "compareWithPageId is required" },
        { status: 400 }
      );
    }

    const store = getMemoryStore();
    const page1 = store.getPage(id);
    const page2 = store.getPage(compareWithPageId);

    if (!page1 || !page2) {
      return NextResponse.json(
        { error: "One or both pages not found" },
        { status: 404 }
      );
    }

    // 두 페이지 분석
    const analysis1 = LayoutOptimizer.analyzeCanvas(page1.canvas);
    const analysis2 = LayoutOptimizer.analyzeCanvas(page2.canvas);

    // 비교 결과 생성
    const comparison = {
      pages: {
        original: { id: page1.id, title: page1.title, analysis: analysis1 },
        compare: { id: page2.id, title: page2.title, analysis: analysis2 }
      },
      differences: {
        elementCountDiff: analysis2.totalElements - analysis1.totalElements,
        complexityChange: getComplexityChange(analysis1.complexity, analysis2.complexity),
        performanceImpact: calculatePerformanceImpact(analysis1.performance, analysis2.performance),
        layoutModeChanges: compareLayoutModes(analysis1.layoutModes, analysis2.layoutModes)
      },
      recommendations: generateComparisonRecommendations(analysis1, analysis2),
      timestamp: new Date()
    };

    return NextResponse.json(comparison, { status: 200 });

  } catch (error) {
    console.error("Failed to compare layouts:", error);
    return NextResponse.json(
      { 
        error: "Failed to compare layouts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// 유틸리티 함수들

function aggregateConversionStrategies(mappings: any[]) {
  const strategies = mappings.reduce((acc: any, mapping) => {
    acc[mapping.conversionStrategy] = (acc[mapping.conversionStrategy] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(strategies).map(([strategy, count]) => ({
    strategy,
    elementCount: count,
    percentage: Math.round((count as number) / mappings.length * 100)
  }));
}

function calculateMigrationEffort(analysis: any, mappings: any[]) {
  let effort = 0;
  
  // 복잡도에 따른 기본 노력도
  switch (analysis.complexity) {
    case "simple": effort += 1; break;
    case "moderate": effort += 3; break;
    case "complex": effort += 5; break;
  }
  
  // 요소 수에 따른 추가 노력도
  effort += Math.ceil(analysis.totalElements / 10);
  
  // 신뢰도가 낮은 변환에 대한 추가 노력도
  const lowConfidenceMappings = mappings.filter(m => m.confidenceScore < 0.7);
  effort += lowConfidenceMappings.length * 0.5;
  
  return {
    score: Math.min(effort, 10), // 최대 10점
    level: effort < 3 ? "low" : effort < 6 ? "medium" : "high",
    estimatedHours: Math.round(effort * 2) // 대략적인 시간 추정
  };
}

function generateMigrationPhases(mappings: any[]) {
  return [
    {
      phase: 1,
      name: "High Confidence Conversions",
      description: "신뢰도가 높은 요소들의 레이아웃 변환",
      elements: mappings.filter(m => m.confidenceScore >= 0.8).map(m => m.legacyElementId),
      estimatedDuration: "1-2 days"
    },
    {
      phase: 2,
      name: "Medium Confidence Conversions",
      description: "중간 신뢰도 요소들의 레이아웃 변환 및 테스트",
      elements: mappings.filter(m => m.confidenceScore >= 0.5 && m.confidenceScore < 0.8).map(m => m.legacyElementId),
      estimatedDuration: "2-3 days"
    },
    {
      phase: 3,
      name: "Manual Review & Complex Cases",
      description: "수동 검토가 필요한 복잡한 케이스들",
      elements: mappings.filter(m => m.confidenceScore < 0.5).map(m => m.legacyElementId),
      estimatedDuration: "1-2 weeks"
    },
    {
      phase: 4,
      name: "Testing & Optimization",
      description: "전체 레이아웃 테스트 및 성능 최적화",
      elements: [],
      estimatedDuration: "3-5 days"
    }
  ];
}

function assessMigrationRisk(analysis: any, mappings: any[]) {
  let riskScore = 0;
  const risks: string[] = [];
  
  // 복잡도 기반 위험도
  if (analysis.complexity === "complex") {
    riskScore += 3;
    risks.push("높은 레이아웃 복잡도로 인한 변환 위험");
  }
  
  // 요소 수 기반 위험도
  if (analysis.totalElements > 50) {
    riskScore += 2;
    risks.push("많은 요소 수로 인한 관리 복잡성");
  }
  
  // 낮은 신뢰도 변환
  const lowConfidenceCount = mappings.filter(m => m.confidenceScore < 0.6).length;
  if (lowConfidenceCount > 5) {
    riskScore += 2;
    risks.push("수동 검토가 필요한 변환이 다수 존재");
  }
  
  // 성능 위험도
  if (analysis.performance.renderingComplexity > 20) {
    riskScore += 1;
    risks.push("렌더링 성능 저하 가능성");
  }
  
  return {
    score: Math.min(riskScore, 10),
    level: riskScore < 3 ? "low" : riskScore < 6 ? "medium" : "high",
    factors: risks,
    mitigation: generateMitigationStrategies(riskScore, risks)
  };
}

function generateMitigationStrategies(riskScore: number, risks: string[]) {
  const strategies: string[] = [
    "점진적 마이그레이션을 통한 위험 최소화",
    "각 단계별 충분한 테스트 수행"
  ];
  
  if (riskScore >= 5) {
    strategies.push("프로토타입 개발을 통한 사전 검증");
    strategies.push("롤백 계획 수립");
  }
  
  if (risks.some(r => r.includes("성능"))) {
    strategies.push("성능 모니터링 도구 설정");
  }
  
  if (risks.some(r => r.includes("복잡성"))) {
    strategies.push("레이아웃 단순화 우선 고려");
  }
  
  return strategies;
}

function getComplexityChange(from: string, to: string): string {
  const levels = { simple: 1, moderate: 2, complex: 3 };
  const diff = (levels as any)[to] - (levels as any)[from];
  
  if (diff > 0) return `increased (${from} → ${to})`;
  if (diff < 0) return `decreased (${from} → ${to})`;
  return `unchanged (${from})`;
}

function calculatePerformanceImpact(perf1: any, perf2: any) {
  return {
    domNodesDiff: perf2.estimatedDOMNodes - perf1.estimatedDOMNodes,
    renderingComplexityDiff: perf2.renderingComplexity - perf1.renderingComplexity,
    responsiveComplexityDiff: perf2.responsiveComplexity - perf1.responsiveComplexity,
    overallImpact: perf2.estimatedDOMNodes > perf1.estimatedDOMNodes * 1.2 ? "negative" : 
                   perf2.estimatedDOMNodes < perf1.estimatedDOMNodes * 0.8 ? "positive" : "neutral"
  };
}

function compareLayoutModes(modes1: any, modes2: any) {
  const changes: any[] = [];
  
  Object.keys(modes1).forEach(mode => {
    const diff = modes2[mode] - modes1[mode];
    if (diff !== 0) {
      changes.push({
        mode,
        change: diff,
        type: diff > 0 ? "increased" : "decreased"
      });
    }
  });
  
  return changes;
}

function generateComparisonRecommendations(analysis1: any, analysis2: any) {
  const recommendations: string[] = [];
  
  if (analysis2.complexity === "complex" && analysis1.complexity !== "complex") {
    recommendations.push("레이아웃 복잡도가 증가했습니다. 단순화를 고려하세요.");
  }
  
  if (analysis2.performance.estimatedDOMNodes > analysis1.performance.estimatedDOMNodes * 1.5) {
    recommendations.push("DOM 노드 수가 크게 증가했습니다. 가상화나 지연 로딩을 고려하세요.");
  }
  
  if (analysis2.totalElements > analysis1.totalElements + 10) {
    recommendations.push("요소 수가 크게 증가했습니다. 컴포넌트 통합을 고려하세요.");
  }
  
  return recommendations;
}