import { NextRequest, NextResponse } from "next/server";
import { getMemoryStore } from "@/shared/lib/memory-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 렌더링을 위한 페이지 데이터 조회 (서버 드리븐 UI용)
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

    // 서버 드리븐 UI를 위한 렌더링 데이터 구조
    const renderData = {
      pageId: page.id,
      title: page.title,
      canvas: {
        width: page.canvas.width,
        height: page.canvas.height,
        elements: page.canvas.elements.map(element => ({
          id: element.id,
          type: element.type,
          position: {
            x: element.x,
            y: element.y
          },
          size: {
            width: element.width,
            height: element.height
          },
          zIndex: element.zIndex,
          style: extractElementStyle(element),
          props: extractElementProps(element),
        }))
      },
      metadata: {
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }
    };

    return NextResponse.json({ data: renderData }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch render data:", error);
    return NextResponse.json(
      { error: "Failed to fetch render data" },
      { status: 500 }
    );
  }
}

// 요소의 스타일 정보 추출
function extractElementStyle(element: any) {
  const style: any = {
    padding: element.padding,
  };

  switch (element.type) {
    case "text":
      return {
        ...style,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        textAlign: element.textAlign,
        fontWeight: element.fontWeight,
        textDecoration: element.textDecoration,
        lineHeight: element.lineHeight,
      };
    
    case "image":
      return {
        ...style,
        objectFit: element.objectFit,
        objectPosition: element.objectPosition,
        filter: element.filter,
      };
    
    case "button":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        textColor: element.textColor,
        borderRadius: element.borderRadius,
      };
    
    case "container":
      return {
        ...style,
        backgroundColor: element.backgroundColor,
        borderRadius: element.borderRadius,
        borderStyle: element.borderStyle,
        borderWidth: element.borderWidth,
        borderColor: element.borderColor,
        boxShadow: element.boxShadow,
      };
    
    default:
      return style;
  }
}

// 요소의 속성 정보 추출
function extractElementProps(element: any) {
  switch (element.type) {
    case "text":
      return {
        content: element.content,
      };
    
    case "image":
      return {
        src: element.src,
        alt: element.alt,
      };
    
    case "button":
      return {
        text: element.text,
        href: element.href,
        variant: element.variant,
        size: element.size,
        icon: element.icon,
        iconPosition: element.iconPosition,
      };
    
    case "accordion":
      return {
        items: element.items,
        variant: element.variant,
        collapsible: element.collapsible,
        accordionType: element.accordionType,
        disabled: element.disabled,
      };
    
    case "calendar":
      return {
        mode: element.mode,
        selectedDate: element.selectedDate,
        selectedDates: element.selectedDates,
        showOutsideDays: element.showOutsideDays,
        disabled: element.disabled,
        defaultMonth: element.defaultMonth,
        fixedWeeks: element.fixedWeeks,
        weekStartsOn: element.weekStartsOn,
      };
    
    default:
      return {};
  }
}