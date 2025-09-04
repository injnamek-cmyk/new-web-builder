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
