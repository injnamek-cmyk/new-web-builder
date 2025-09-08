import { NextRequest, NextResponse } from "next/server";
import { getMemoryStore } from "@/shared/lib/memory-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 특정 페이지 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const store = getMemoryStore();
    const page = store.getPage(id);

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

// 페이지 업데이트
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { title, canvas } = await request.json();

    const store = getMemoryStore();
    const updatedPage = store.updatePage(id, { title, canvas });
    
    if (!updatedPage) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
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
  try {
    const { id } = await params;
    
    const store = getMemoryStore();
    const success = store.deletePage(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

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