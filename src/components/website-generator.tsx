"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/processes/editor-store";
import { Download, Globe, Loader2, Rocket, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WebsiteGeneratorProps {
  className?: string;
}

export default function WebsiteGenerator({ className }: WebsiteGeneratorProps) {
  const { canvas } = useEditorStore();
  const [isGenerating] = useState(false);

  const handleGenerateWebsite = async () => {
    alert("HTML 생성 기능은 준비 중입니다.");
  };

  const handleBuildWebsite = async () => {
    alert("프로젝트 빌드 기능은 준비 중입니다.");
  };

  const handleDeployWebsite = async () => {
    alert("배포 기능은 준비 중입니다.");
  };

  const isLoading = isGenerating;

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading || canvas.elements.length === 0}
            className={`
              bg-gradient-to-r from-emerald-500 to-teal-600 
              hover:from-emerald-600 hover:to-teal-700 
              text-white shadow-lg rounded-full px-6 py-3 
              font-semibold transition-all duration-300 
              transform hover:scale-105 hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:transform-none disabled:hover:shadow-lg
              ${className}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2" />
                웹사이트 만들기
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem
            onClick={handleGenerateWebsite}
            disabled={isLoading}
            className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">HTML 다운로드</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleBuildWebsite}
            disabled={isLoading}
            className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span className="font-medium">프로젝트 빌드</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeployWebsite}
            disabled={isLoading}
            className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <Rocket className="w-4 h-4" />
            <span className="font-medium">Vercel 배포</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}
