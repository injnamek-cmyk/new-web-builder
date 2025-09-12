"use client";

import React, { useEffect, useState } from "react";
import { ButtonElement } from "@/shared/types";
import { cn, getValidPaddingValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMode } from "@/shared/contexts/mode-context";
import {
  Home,
  User,
  Settings,
  Mail,
  Phone,
  Search,
  Download,
  Upload,
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

interface ButtonElementProps {
  element: ButtonElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

// 아이콘 렌더링 함수
const renderIcon = (iconName: string, className: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Home,
    User,
    Settings,
    Mail,
    Phone,
    Search,
    Download,
    Upload,
    Heart,
    Star,
    Plus,
    Minus,
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    ArrowLeft,
    ShoppingCart,
    CreditCard,
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
  const { mode } = useMode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버 사이드 렌더링 중에는 간단한 버전을 렌더링
  if (!isClient) {
    return (
      <div
        className="absolute cursor-pointer select-none"
        style={{
          left: element.x,
          top: element.y,
          zIndex: element.zIndex,
          position: "absolute",
        }}
        onClick={onSelect}
      >
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
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
        zIndex: element.zIndex,
        position: "absolute",
      }}
      onClick={onSelect}
      suppressHydrationWarning={true}
    >
      <Button
        variant={
          (element.variant as
            | "default"
            | "destructive"
            | "outline"
            | "secondary"
            | "ghost"
            | "link") || "default"
        }
        size={(element.size as "default" | "sm" | "lg" | "icon") || "default"}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (element.href && mode === 'preview') {
            window.open(element.href, "_blank");
          }
        }}
        suppressHydrationWarning={true}
      >
        {element.icon &&
          element.icon !== "none" &&
          element.iconPosition === "left" &&
          renderIcon(element.icon, "w-4 h-4 mr-2")}
        {element.text || "버튼"}
        {element.icon &&
          element.icon !== "none" &&
          element.iconPosition === "right" &&
          renderIcon(element.icon, "w-4 h-4 ml-2")}
      </Button>
    </div>
  );
}
