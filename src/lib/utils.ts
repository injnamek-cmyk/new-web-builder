import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 패딩 값이 유효하지 않을 때 기본값 0을 반환하는 유틸리티 함수
export function getValidPaddingValue(
  value: number | undefined | null | string
): number {
  // null이나 undefined인 경우
  if (value == null) {
    return 0;
  }

  // 빈 문자열인 경우
  if (typeof value === "string" && value.trim() === "") {
    return 0;
  }

  // 숫자인 경우
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  // 문자열을 숫자로 변환 시도
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  // 모든 경우에 해당하지 않으면 0 반환
  return 0;
}

// 요소의 실제 크기를 계산하는 유틸리티 함수 (패딩 포함)
export function getElementActualSize(element: {
  width: number | string;
  height: number | string;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  type: string;
}): { width: number; height: number } {
  const safePadding = {
    top: getValidPaddingValue(element.padding?.top),
    right: getValidPaddingValue(element.padding?.right),
    bottom: getValidPaddingValue(element.padding?.bottom),
    left: getValidPaddingValue(element.padding?.left),
  };

  let actualWidth: number;
  let actualHeight: number;

  if (element.type === "button") {
    actualWidth =
      element.width === "auto"
        ? 100 // 버튼 기본 너비
        : Math.max(
            (element.width as number) + safePadding.left + safePadding.right,
            20
          );
    actualHeight =
      element.height === "auto"
        ? 40 // 버튼 기본 높이
        : Math.max(
            (element.height as number) + safePadding.top + safePadding.bottom,
            20
          );
  } else if (element.type === "accordion") {
    actualWidth =
      element.width === "auto"
        ? 300 // 아코디언 기본 너비
        : (element.width as number) + safePadding.left + safePadding.right;
    actualHeight =
      element.height === "auto"
        ? 200 // 아코디언 기본 높이
        : (element.height as number) + safePadding.top + safePadding.bottom;
  } else {
    // 다른 요소 타입들
    actualWidth =
      element.width === "auto"
        ? 100 // 기본 너비
        : (element.width as number) + safePadding.left + safePadding.right;
    actualHeight =
      element.height === "auto"
        ? 100 // 기본 높이
        : (element.height as number) + safePadding.top + safePadding.bottom;
  }

  return { width: actualWidth, height: actualHeight };
}
