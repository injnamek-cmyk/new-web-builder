import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 사용자의 모든 페이지 조회
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const pages = await prisma.page.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// 새 페이지 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userId = session.user.id;

    // 요청 본문(title, canvas 등) 전체를 content 필드에 저장합니다.
    const newPage = await prisma.page.create({
      data: {
        content: body,
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        message: "Page created successfully",
        page: newPage,
      },
      { status: 201 }
    ); // 201 Created 상태 코드 사용
  } catch (error) {
    console.error("Failed to create page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
