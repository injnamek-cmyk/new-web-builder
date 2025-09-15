import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextjsTemplateGenerator } from "@/shared/lib/nextjs-template-generator";
import { ComponentDependencyAnalyzer } from "@/shared/lib/component-dependency-analyzer";
import * as fs from 'fs';
import * as path from 'path';
import { Element, Canvas } from "@/shared/types";

const prisma = new PrismaClient();

export interface DeployRequest {
  pageId?: string; // 기존 페이지에서 배포
  elements?: Element[]; // 또는 직접 요소 전달
  canvas?: Canvas;
  config: {
    projectName: string;
    domain?: string;
    analytics?: boolean;
    theme?: "light" | "dark" | "system";
  };
}

export interface DeployResponse {
  success: boolean;
  deployUrl?: string;
  projectFiles?: any[];
  buildLogs?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<DeployResponse>> {
  try {
    const body: DeployRequest = await request.json();
    console.log('Deploy request received:', JSON.stringify(body, null, 2));

    // 1. 페이지 데이터 가져오기
    let elements: Element[] = [];
    let canvas: Canvas = { width: 1920, height: 1080, backgroundColor: "#ffffff" };

    if (body.pageId) {
      // 기존 페이지에서 데이터 가져오기
      console.log('Fetching page data for ID:', body.pageId);
      const page = await prisma.page.findUnique({
        where: { id: body.pageId }
      });

      if (!page || !page.content) {
        console.error('Page not found or content is empty:', { page: !!page, content: !!page?.content });
        return NextResponse.json({
          success: false,
          error: "Page not found or content is empty"
        }, { status: 404 });
      }

      const pageContent = page.content as any;
      elements = pageContent.canvas?.elements || [];
      canvas = pageContent.canvas || canvas;
      console.log('Page data loaded:', { elementsCount: elements.length, canvas });
    } else if (body.elements && body.canvas) {
      // 직접 전달된 데이터 사용
      elements = body.elements;
      canvas = body.canvas;
    } else {
      return NextResponse.json({
        success: false,
        error: "Either pageId or elements/canvas must be provided"
      }, { status: 400 });
    }

    // 2. 컴포넌트 의존성 분석
    console.log('Starting component dependency analysis...');
    const analyzer = new ComponentDependencyAnalyzer();
    const requiredComponents = analyzer.analyzeRequiredComponents(elements);

    console.log(`Found ${requiredComponents.length} required components:`,
      requiredComponents.map(c => c.name));

    // 3. Next.js 프로젝트 생성
    console.log('Creating Next.js template generator...');
    const generator = new NextjsTemplateGenerator({
      projectName: body.config.projectName,
      elements,
      canvas,
      domain: body.config.domain,
      analytics: body.config.analytics,
      theme: body.config.theme
    });

    console.log('Sanitized project name:', generator.getProjectName());

    // 4. Next.js 프로젝트 파일 생성 (컴포넌트 포함)
    console.log('Generating project files...');
    const projectFiles = generator.generateProject();
    console.log(`Generated ${projectFiles.length} project files`);

    // 모든 필요한 파일이 generator에서 생성됨

    // 5. 배포 프로세스 (실제로는 Vercel API 호출 등)
    console.log('Starting deployment to Vercel...');
    const deployResult = await deployToVercel(projectFiles, {
      ...body.config,
      projectName: generator.getProjectName() // 정제된 프로젝트명 전달
    });
    console.log('Deployment completed:', { success: !!deployResult.url, url: deployResult.url });

    return NextResponse.json({
      success: true,
      deployUrl: deployResult.url,
      projectFiles: projectFiles.map(f => ({ path: f.path, size: f.content.length })),
      buildLogs: deployResult.logs
    });

  } catch (error) {
    console.error('Deploy error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Vercel 배포 함수
async function deployToVercel(files: any[], config: any) {
  console.log('deployToVercel called with:', {
    filesCount: files.length,
    projectName: config.projectName
  });

  // 환경변수에서 Vercel 설정 확인
  const vercelToken = process.env.VERCEL_API_TOKEN;

  if (!vercelToken) {
    // Vercel 토큰이 없으면 시뮬레이션 모드
    console.log('VERCEL_API_TOKEN not found, running in simulation mode');

    const buildLogs = [
      "📦 Installing dependencies...",
      "⚡ Building Next.js application...",
      "✅ Build completed successfully",
      "🚀 Deploying to Vercel (simulation)...",
      "✅ Deployment completed (simulation)"
    ];

    const projectSlug = config.projectName.toLowerCase().replace(/\s+/g, '-');
    const deployUrl = `https://${projectSlug}-${Math.random().toString(36).substring(2, 11)}.vercel.app`;

    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      url: deployUrl,
      logs: buildLogs
    };
  }

  // 실제 Vercel 배포
  console.log('Using real Vercel deployment with token');
  try {
    const { VercelDeployer } = await import('@/shared/lib/vercel-deployer');
    const deployer = new VercelDeployer(vercelToken, process.env.VERCEL_TEAM_ID);

    console.log('Created VercelDeployer, starting deployment...');

    const result = await deployer.deploy({
      projectName: config.projectName, // 이제 정제된 프로젝트명이 전달됨
      files: files,
      environment: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      },
      domain: config.domain
    });

    console.log('Vercel deployment result:', { success: result.success, error: result.error });

    if (!result.success) {
      throw new Error(result.error || 'Deployment failed');
    }

    return {
      url: result.url,
      logs: result.logs,
      deploymentId: result.deploymentId
    };
  } catch (error) {
    console.error('Vercel deployment error:', error);
    throw error;
  }
}

// 배포 상태 확인을 위한 GET 엔드포인트
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('deploymentId');

  if (!deploymentId) {
    return NextResponse.json({
      error: "Deployment ID is required"
    }, { status: 400 });
  }

  // 실제로는 Vercel API에서 배포 상태 확인
  const status = {
    deploymentId,
    status: "ready", // building, ready, error
    url: `https://example-${deploymentId}.vercel.app`,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json(status);
}