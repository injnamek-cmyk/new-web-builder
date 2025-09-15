"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/processes/editor-store";
import { Save, Eye, Loader2, ExternalLink, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageActionsProps {
  className?: string;
}

export default function PageActions({ className }: PageActionsProps) {
  const {
    isSaving,
    savePage,
    getPreviewUrl,
    canvas,
    currentPageTitle,
    currentPageId,
  } = useEditorStore();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  const handleSave = async () => {
    const pageId = await savePage();
    if (pageId) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
  };

  const handlePreview = () => {
    const previewUrl = getPreviewUrl();
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      alert("페이지를 먼저 저장해주세요.");
    }
  };

  const handleDeploy = async () => {
    if (canvas.elements.length === 0) {
      alert("배포할 요소가 없습니다. 먼저 요소를 추가해주세요.");
      return;
    }

    if (!currentPageId) {
      alert("페이지를 먼저 저장해주세요.");
      return;
    }

    setIsDeploying(true);
    setDeployUrl(null);

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: currentPageId,
          config: {
            projectName: currentPageTitle || 'My Website',
            analytics: false,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeployUrl(result.deployUrl);
        alert(`배포 완료! URL: ${result.deployUrl}`);
      } else {
        alert(`배포 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Deploy error:', error);
      alert('배포 중 오류가 발생했습니다.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 저장 버튼 */}
      <Button
        variant="default"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            저장 중...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            저장
          </>
        )}
      </Button>

      {/* 미리보기 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreview}
      >
        <Eye className="w-4 h-4 mr-2" />
        미리보기
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>

      {/* 배포하기 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeploy}
        disabled={isDeploying}
        className="text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            배포 중...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4 mr-2" />
            배포하기
          </>
        )}
      </Button>

      {/* 배포 완료 시 URL 표시 */}
      {deployUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(deployUrl, '_blank')}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          사이트 보기
        </Button>
      )}

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg z-50">
          ✅ 페이지가 성공적으로 저장되었습니다!
        </div>
      )}
    </div>
  );
}