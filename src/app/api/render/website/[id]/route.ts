import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Website와 모든 페이지의 렌더링 데이터 조회를 위한 API
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Website ID is required" }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { path: 'asc' }
        }
      }
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // 페이지별 content 파싱
    const parsedPages = website.pages.map(page => {
      let parsedContent;
      try {
        parsedContent = typeof page.content === 'string'
          ? JSON.parse(page.content)
          : page.content;
      } catch (e) {
        console.error(`Failed to parse content for page ${page.id}:`, e);
        parsedContent = [];
      }

      return {
        id: page.id,
        title: page.title,
        path: page.path,
        content: parsedContent,
        metadata: page.metadata,
        isPublished: page.isPublished,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      };
    });

    const renderData = {
      websiteId: website.id,
      name: website.name,
      description: website.description,
      domain: website.domain,
      subdomain: website.subdomain,
      isPublished: website.isPublished,
      pages: parsedPages,
      metadata: {
        createdAt: website.createdAt,
        updatedAt: website.updatedAt,
      }
    };

    return NextResponse.json(renderData, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch render data for website ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch render data" },
      { status: 500 }
    );
  }
}