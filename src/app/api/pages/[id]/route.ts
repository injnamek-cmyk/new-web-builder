import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

interface RouteParams {
  params: { id: string };
}

// 특정 페이지 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ page }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// 페이지 업데이트 또는 생성
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const userId = session.user.id;

    const updatedPage = await prisma.page.upsert({
      where: { id },
      update: {
        content: body,
      },
      create: {
        id,
        content: body,
        userId: userId,
      },
    });

    // 보안 강화: 사용자가 자신의 페이지만 업데이트할 수 있도록 확인
    if (updatedPage.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ 
      message: "Page updated successfully", 
      page: updatedPage 
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to update page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// 페이지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const userId = session.user.id;

    const page = await prisma.page.findUnique({
        where: { id },
    });

    if (page?.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Page deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
