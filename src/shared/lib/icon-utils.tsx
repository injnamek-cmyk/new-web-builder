import React from "react";
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

// 아이콘 렌더링 함수
export const renderIcon = (iconName: string, className: string) => {
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