import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UpdatePageRequest, ValidationError } from "@/shared/types";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

function validatePagePath(path: string): boolean {
  const pathRegex = /^\/[a-zA-Z0-9\-\/]*$/;
  return pathRegex.test(path) && path.length > 1 && path.length <= 255;
}

function validateUpdatePageData(data: UpdatePageRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push({ field: "title", message: "제목은 필수입니다." });
    } else if (data.title.length > 255) {
      errors.push({ field: "title", message: "제목은 255자를 초과할 수 없습니다." });
    }
  }

  if (data.path !== undefined) {
    if (!data.path || data.path.trim().length === 0) {
      errors.push({ field: "path", message: "경로는 필수입니다." });
    } else if (!validatePagePath(data.path)) {
      errors.push({
        field: "path",
        message: "경로는 /로 시작하고 영문자, 숫자, 하이픈, 슬래시만 포함할 수 있습니다."
      });
    }
  }

  return errors;
}

// 특정 페이지 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
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
    console.error("Failed to fetch page:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch page"
    }, { status: 500 });
  }
}

// 페이지 업데이트
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body: UpdatePageRequest = await request.json();
    const userId = session.user.id;

    // 유효성 검사
    const validationErrors = validateUpdatePageData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        validationErrors
      }, { status: 400 });
    }

    // 페이지 소유권 확인
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json({
        success: false,
        error: "Page not found"
      }, { status: 404 });
    }

    if (existingPage.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Forbidden"
      }, { status: 403 });
    }

    // 경로 중복 확인 (경로를 변경하는 경우)
    if (body.path && body.path !== existingPage.path) {
      const pathExists = await prisma.page.findUnique({
        where: {
          websiteId_path: {
            websiteId: existingPage.websiteId,
            path: body.path,
          }
        },
      });

      if (pathExists) {
        return NextResponse.json({
          success: false,
          error: "Path already exists",
          validationErrors: [{
            field: "path",
            message: "이미 사용 중인 경로입니다."
          }]
        }, { status: 409 });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.path !== undefined) updateData.path = body.path;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    if (body.metadata !== undefined) {
      updateData.metadata = {
        ...existingPage.metadata as object,
        ...body.metadata,
      };
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: updateData,
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
      data: updatedPage
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to update page:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update page"
    }, { status: 500 });
  }
}

// 페이지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = session.user.id;

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: "Page not found"
      }, { status: 404 });
    }

    if (page.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Forbidden"
      }, { status: 403 });
    }

    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Page deleted successfully" }
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete page:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete page"
    }, { status: 500 });
  }
}
