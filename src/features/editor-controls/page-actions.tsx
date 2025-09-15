"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/processes/editor-store";
import { downloadHTMLHybrid } from "@/shared/lib/html-export-hybrid";
import { Save, Eye, Loader2, ExternalLink, Download } from "lucide-react";
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
  } = useEditorStore();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  const handleExportHTML = () => {
    if (canvas.elements.length === 0) {
      alert("내보낼 요소가 없습니다. 먼저 요소를 추가해주세요.");
      return;
    }

    const filename = `${currentPageTitle || 'web-page'}.html`;
    downloadHTMLHybrid(canvas, filename, {
      title: currentPageTitle || 'Web Builder Export',
      responsive: true,
      includeTailwind: false,
      includeBootstrap: false
    });
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

      {/* HTML 내보내기 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportHTML}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        <Download className="w-4 h-4 mr-2" />
        HTML 내보내기
      </Button>

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg z-50">
          ✅ 페이지가 성공적으로 저장되었습니다!
        </div>
      )}
    </div>
  );
}