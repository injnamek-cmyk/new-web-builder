import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateWebsiteRequest, ValidationError } from "@/shared/types";

const prisma = new PrismaClient();

function validateSubdomain(subdomain: string): boolean {
  // 서브도메인은 영문자, 숫자, 하이픈만 허용하고, 3-63자 길이
  const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/;
  return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
}

function validateWebsiteData(data: CreateWebsiteRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: "name", message: "웹사이트 이름은 필수입니다." });
  } else if (data.name.length > 255) {
    errors.push({ field: "name", message: "웹사이트 이름은 255자를 초과할 수 없습니다." });
  }

  if (!data.subdomain || data.subdomain.trim().length === 0) {
    errors.push({ field: "subdomain", message: "서브도메인은 필수입니다." });
  } else if (!validateSubdomain(data.subdomain)) {
    errors.push({
      field: "subdomain",
      message: "서브도메인은 3-63자의 영문자, 숫자, 하이픈만 사용할 수 있습니다."
    });
  }

  if (data.domain && data.domain.length > 255) {
    errors.push({ field: "domain", message: "도메인은 255자를 초과할 수 없습니다." });
  }

  if (data.description && data.description.length > 1000) {
    errors.push({ field: "description", message: "설명은 1000자를 초과할 수 없습니다." });
  }

  return errors;
}

// 사용자의 모든 웹사이트 조회
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const websites = await prisma.website.findMany({
      where: {
        userId: userId,
      },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            path: true,
            isPublished: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: websites
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch websites"
    }, { status: 500 });
  }
}

// 새 웹사이트 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      error: "Unauthorized"
    }, { status: 401 });
  }

  try {
    const body: CreateWebsiteRequest = await request.json();
    const userId = session.user.id;

    // 유효성 검사
    const validationErrors = validateWebsiteData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        validationErrors
      }, { status: 400 });
    }

    // 서브도메인 중복 확인
    const existingWebsite = await prisma.website.findUnique({
      where: { subdomain: body.subdomain },
    });

    if (existingWebsite) {
      return NextResponse.json({
        success: false,
        error: "Subdomain already exists",
        validationErrors: [{
          field: "subdomain",
          message: "이미 사용 중인 서브도메인입니다."
        }]
      }, { status: 409 });
    }

    const newWebsite = await prisma.website.create({
      data: {
        name: body.name,
        description: body.description,
        domain: body.domain,
        subdomain: body.subdomain,
        userId: userId,
      },
      include: {
        pages: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newWebsite,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create website:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create website"
    }, { status: 500 });
  }
}