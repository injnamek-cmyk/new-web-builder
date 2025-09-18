"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/processes/editor-store";
import { convertToFlatStructure } from "@/shared/types/flat-ui-structure";
import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebsiteGeneratorButtonProps {
  className?: string;
}

export default function WebsiteGeneratorButton({ 
  className 
}: WebsiteGeneratorButtonProps) {
  const { canvas } = useEditorStore();

  const handleGenerateWebsite = () => {
    // 캔버스 데이터를 플랫한 구조로 변환
    const flatStructure = convertToFlatStructure(canvas);
    
    console.log("🎨 생성된 웹사이트 구조 (서버 드리븐 UI):", flatStructure);
    console.log("📊 JSON 형태:", JSON.stringify(flatStructure, null, 2));
    
    // 사용자에게 알림
    alert(`웹사이트 구조가 콘솔에 출력되었습니다!\n요소 개수: ${flatStructure.length}개`);
  };

  return (
    <Button
      onClick={handleGenerateWebsite}
      className={cn(
        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg font-medium transition-all duration-200 transform hover:scale-105",
        className
      )}
    >
      <FileCode className="w-4 h-4 mr-2" />
      웹사이트 만들기
    </Button>
  );
}