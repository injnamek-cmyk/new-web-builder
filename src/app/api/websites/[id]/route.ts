import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UpdateWebsiteRequest, ValidationError } from "@/shared/types";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

function validateSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/;
  return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
}

function validateUpdateWebsiteData(data: UpdateWebsiteRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: "name", message: "웹사이트 이름은 필수입니다." });
    } else if (data.name.length > 255) {
      errors.push({ field: "name", message: "웹사이트 이름은 255자를 초과할 수 없습니다." });
    }
  }

  if (data.subdomain !== undefined) {
    if (!data.subdomain || data.subdomain.trim().length === 0) {
      errors.push({ field: "subdomain", message: "서브도메인은 필수입니다." });
    } else if (!validateSubdomain(data.subdomain)) {
      errors.push({
        field: "subdomain",
        message: "서브도메인은 3-63자의 영문자, 숫자, 하이픈만 사용할 수 있습니다."
      });
    }
  }

  if (data.domain !== undefined && data.domain && data.domain.length > 255) {
    errors.push({ field: "domain", message: "도메인은 255자를 초과할 수 없습니다." });
  }

  if (data.description !== undefined && data.description && data.description.length > 1000) {
    errors.push({ field: "description", message: "설명은 1000자를 초과할 수 없습니다." });
  }

  return errors;
}

// 특정 웹사이트 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!website) {
      return NextResponse.json({
        success: false,
        error: "Website not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: website
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch website:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch website"
    }, { status: 500 });
  }
}

// 웹사이트 업데이트
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
    const body: UpdateWebsiteRequest = await request.json();
    const userId = session.user.id;

    // 유효성 검사
    const validationErrors = validateUpdateWebsiteData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        validationErrors
      }, { status: 400 });
    }

    // 웹사이트 소유권 확인
    const existingWebsite = await prisma.website.findUnique({
      where: { id },
    });

    if (!existingWebsite) {
      return NextResponse.json({
        success: false,
        error: "Website not found"
      }, { status: 404 });
    }

    if (existingWebsite.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Forbidden"
      }, { status: 403 });
    }

    // 서브도메인 중복 확인 (서브도메인을 변경하는 경우)
    if (body.subdomain && body.subdomain !== existingWebsite.subdomain) {
      const subdomainExists = await prisma.website.findUnique({
        where: { subdomain: body.subdomain },
      });

      if (subdomainExists) {
        return NextResponse.json({
          success: false,
          error: "Subdomain already exists",
          validationErrors: [{
            field: "subdomain",
            message: "이미 사용 중인 서브도메인입니다."
          }]
        }, { status: 409 });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.domain !== undefined) updateData.domain = body.domain;
    if (body.subdomain !== undefined) updateData.subdomain = body.subdomain;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const updatedWebsite = await prisma.website.update({
      where: { id },
      data: updateData,
      include: {
        pages: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWebsite
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to update website:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update website"
    }, { status: 500 });
  }
}

// 웹사이트 삭제
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

    const website = await prisma.website.findUnique({
      where: { id },
    });

    if (!website) {
      return NextResponse.json({
        success: false,
        error: "Website not found"
      }, { status: 404 });
    }

    if (website.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: "Forbidden"
      }, { status: 403 });
    }

    await prisma.website.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Website deleted successfully" }
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete website:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete website"
    }, { status: 500 });
  }
}