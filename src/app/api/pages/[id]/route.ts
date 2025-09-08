import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
  try {
    const { id } = params;
    const body = await request.json();

    const updatedPage = await prisma.page.upsert({
      where: { id },
      update: {
        content: body,
      },
      create: {
        id,
        content: body,
      },
    });

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
  try {
    const { id } = params;
    
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
