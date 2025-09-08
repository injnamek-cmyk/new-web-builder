import { NextRequest, NextResponse } from "next/server";
import { getMemoryStore } from "@/shared/lib/memory-store";

// 페이지 목록 조회
export async function GET() {
  try {
    const store = getMemoryStore();
    const pages = store.getAllPages();
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
  try {
    const { title, canvas } = await request.json();
    
    if (!title || !canvas) {
      return NextResponse.json(
        { error: "Title and canvas are required" },
        { status: 400 }
      );
    }

    const store = getMemoryStore();
    const pageData = store.createPage(title, canvas);

    return NextResponse.json({ 
      message: "Page created successfully", 
      page: pageData 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}