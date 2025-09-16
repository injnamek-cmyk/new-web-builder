import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreatePageRequest, ValidationError } from "@/shared/types";

const prisma = new PrismaClient();

function validatePagePath(path: string): boolean {
  // 경로는 /로 시작하고, 영문자, 숫자, 하이픈, 슬래시만 허용
  const pathRegex = /^\/[a-zA-Z0-9\-\/]*$/;
  return pathRegex.test(path) && path.length > 1 && path.length <= 255;
}

function validatePageData(data: CreatePageRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: "title", message: "제목은 필수입니다." });
  } else if (data.title.length > 255) {
    errors.push({ field: "title", message: "제목은 255자를 초과할 수 없습니다." });
  }

  if (!data.path || data.path.trim().length === 0) {
    errors.push({ field: "path", message: "경로는 필수입니다." });
  } else if (!validatePagePath(data.path)) {
    errors.push({
      field: "path",
      message: "경로는 /로 시작하고 영문자, 숫자, 하이픈, 슬래시만 포함할 수 있습니다."
    });
  }

  if (!data.websiteId || data.websiteId.trim().length === 0) {
    errors.push({ field: "websiteId", message: "웹사이트 ID는 필수입니다." });
  }

  return errors;
}

// 특정 웹사이트의 모든 페이지 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const userId = session.user.id;

    if (!websiteId) {
      return NextResponse.json({
        success: false,
        error: "Website ID is required"
      }, { status: 400 });
    }

    // 웹사이트 소유권 확인
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website || website.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Website not found or access denied"
      }, { status: 404 });
    }

    const pages = await prisma.page.findMany({
      where: {
        websiteId: websiteId,
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pages
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch pages"
    }, { status: 500 });
  }
}

// 새 페이지 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const body: CreatePageRequest = await request.json();
    const userId = session.user.id;

    // 유효성 검사
    const validationErrors = validatePageData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        validationErrors
      }, { status: 400 });
    }

    // 웹사이트 존재 및 소유권 확인
    const website = await prisma.website.findUnique({
      where: { id: body.websiteId },
    });

    if (!website || website.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Website not found or access denied",
        validationErrors: [{
          field: "websiteId",
          message: "웹사이트를 찾을 수 없거나 접근 권한이 없습니다."
        }]
      }, { status: 404 });
    }

    // 웹사이트 내에서 경로 중복 확인
    const existingPage = await prisma.page.findUnique({
      where: {
        websiteId_path: {
          websiteId: body.websiteId,
          path: body.path,
        }
      },
    });

    if (existingPage) {
      return NextResponse.json({
        success: false,
        error: "Path already exists",
        validationErrors: [{
          field: "path",
          message: "이 웹사이트에서 이미 사용 중인 경로입니다."
        }]
      }, { status: 409 });
    }

    const newPage = await prisma.page.create({
      data: {
        title: body.title,
        path: body.path,
        content: [],
        metadata: {
          title: body.metadata?.title || body.title,
          description: body.metadata?.description || "",
          keywords: body.metadata?.keywords || "",
          ogTitle: body.metadata?.ogTitle || body.title,
          ogDescription: body.metadata?.ogDescription || "",
          ogImage: body.metadata?.ogImage || "",
        },
        userId: userId,
        websiteId: body.websiteId,
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newPage,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create page:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create page"
    }, { status: 500 });
  }
}
