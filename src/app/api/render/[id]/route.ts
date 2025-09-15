import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 특정 페이지의 렌더링 데이터(content) 조회를 위한 API
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page || !page.content) {
      return NextResponse.json({ error: "Page not found or content is empty" }, { status: 404 });
    }

    // content(JSON)와 다른 메타데이터를 조합하여 최종 렌더링 데이터를 구성합니다.
    const renderData = {
      pageId: page.id,
      ...(page.content as object), // title, canvas를 포함
      metadata: {
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      }
    };

    return NextResponse.json(renderData, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch render data for page ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch render data" },
      { status: 500 }
    );
  }
}