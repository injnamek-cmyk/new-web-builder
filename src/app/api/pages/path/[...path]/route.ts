import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

// 경로로 페이지 조회 (공개 API)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { path } = await params;
    const fullPath = "/" + path.join("/");

    const page = await prisma.page.findUnique({
      where: {
        path: fullPath,
        isPublished: true
      },
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: "Page not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: page
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch page by path:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch page"
    }, { status: 500 });
  }
}