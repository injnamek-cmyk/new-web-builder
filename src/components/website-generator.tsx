"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/processes/editor-store";
import { generateHTML, downloadHTML } from "@/lib/html-generator";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const handleGenerateWebsite = async () => {
    if (canvas.elements.length === 0) {
      alert("캔버스에 요소가 없습니다. 먼저 요소를 추가해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      // HTML 생성 (이제 async)
      const html = await generateHTML(canvas.elements);

      // 파일명 생성 (현재 시간 포함)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `website-${timestamp}.html`;

      // 다운로드
      downloadHTML(html, filename);

      // 성공 메시지
      setTimeout(() => {
        alert("웹사이트가 성공적으로 생성되었습니다!");
      }, 100);
    } catch (error) {
      console.error("웹사이트 생성 중 오류 발생:", error);
      alert("웹사이트 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuildWebsite = async () => {
    if (canvas.elements.length === 0) {
      alert("캔버스에 요소가 없습니다. 먼저 요소를 추가해주세요.");
      return;
    }

    setIsBuilding(true);

    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elements: canvas.elements,
          projectName: `website-${Date.now()}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `웹사이트가 성공적으로 빌드되었습니다!\n프로젝트: ${result.projectName}`
        );
      } else {
        throw new Error(result.error || "빌드 실패");
      }
    } catch (error) {
      console.error("웹사이트 빌드 중 오류 발생:", error);
      alert(
        `웹사이트 빌드 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeployWebsite = async () => {
    if (canvas.elements.length === 0) {
      alert("캔버스에 요소가 없습니다. 먼저 요소를 추가해주세요.");
      return;
    }

    setIsDeploying(true);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elements: canvas.elements,
          projectName: `website-${Date.now()}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeployedUrl(result.url);
        alert(`웹사이트가 성공적으로 배포되었습니다!\nURL: ${result.url}`);
      } else {
        throw new Error(result.error || "배포 실패");
      }
    } catch (error) {
      console.error("웹사이트 배포 중 오류 발생:", error);
      alert(
        `웹사이트 배포 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const isLoading = isGenerating || isBuilding || isDeploying;

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
                {isGenerating && "생성 중..."}
                {isBuilding && "빌드 중..."}
                {isDeploying && "배포 중..."}
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

      {deployedUrl && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">배포된 웹사이트:</p>
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
          >
            {deployedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
