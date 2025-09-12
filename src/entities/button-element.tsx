"use client";

import React, { useEffect, useState } from "react";
import { ButtonElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, User, Settings, Mail, Phone, Search, Download, Upload, 
  Heart, Star, Plus, Minus, Check, X, ChevronRight, ChevronLeft,
  ArrowRight, ArrowLeft, ShoppingCart, CreditCard
} from "lucide-react";

interface ButtonElementProps {
  element: ButtonElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

// 아이콘 렌더링 함수
const renderIcon = (iconName: string, className: string) => {
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    Home, User, Settings, Mail, Phone, Search, Download, Upload,
    Heart, Star, Plus, Minus, Check, X, ChevronRight, ChevronLeft,
    ArrowRight, ArrowLeft, ShoppingCart, CreditCard
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default function ButtonElementComponent({
  element,
  isSelected,
  onSelect,
}: ButtonElementProps) {
  // 클라이언트 사이드에서만 렌더링되도록 하여 Hydration mismatch 방지
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 실제 요소의 최종 크기 계산 (패딩 포함)
  const safePadding = {
    top: getValidPaddingValue(element.padding.top),
    right: getValidPaddingValue(element.padding.right),
    bottom: getValidPaddingValue(element.padding.bottom),
    left: getValidPaddingValue(element.padding.left),
  };

  const actualWidth =
    element.width === "auto"
      ? "auto"
      : Math.max(element.width + safePadding.left + safePadding.right, 20);
  const actualHeight =
    element.height === "auto"
      ? "auto"
      : Math.max(element.height + safePadding.top + safePadding.bottom, 20);

  // shadcn Button 컴포넌트에 전달할 스타일
  const buttonStyle = {
    width: element.width === "auto" ? "auto" : "100%",
    height: element.height === "auto" ? "auto" : "100%",
    minWidth: element.width === "auto" ? "fit-content" : 20,
    minHeight: element.height === "auto" ? "fit-content" : 20,
  };

  // 서버 사이드 렌더링 중에는 간단한 버전을 렌더링
  if (!isClient) {
    return (
      <div
        className="absolute cursor-pointer select-none"
        style={{
          left: element.x,
          top: element.y,
          width: actualWidth,
          height: actualHeight,
          zIndex: element.zIndex,
          position: "absolute",
          minWidth: element.width === "auto" ? "fit-content" : 20,
          minHeight: element.height === "auto" ? "fit-content" : 20,
        }}
        onClick={onSelect}
      >
        <div
          style={buttonStyle}
          className="w-full h-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {element.text || "버튼"}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute cursor-pointer select-none",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      style={{
        left: element.x,
        top: element.y,
        width: actualWidth,
        height: actualHeight,
        zIndex: element.zIndex,
        position: "absolute",
        minWidth: element.width === "auto" ? "fit-content" : 20,
        minHeight: element.height === "auto" ? "fit-content" : 20,
      }}
      onClick={onSelect}
      suppressHydrationWarning={true}
    >
      <Button
        variant={(element.variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link") || "default"}
        size={(element.size as "default" | "sm" | "lg" | "icon") || "default"}
        style={buttonStyle}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (element.href) {
            window.open(element.href, "_blank");
          }
        }}
        className="w-full h-full"
        suppressHydrationWarning={true}
      >
        {element.icon && element.icon !== "none" && element.iconPosition === "left" && renderIcon(element.icon, "w-4 h-4 mr-2")}
        {element.text || "버튼"}
        {element.icon && element.icon !== "none" && element.iconPosition === "right" && renderIcon(element.icon, "w-4 h-4 ml-2")}
      </Button>
    </div>
  );
}
