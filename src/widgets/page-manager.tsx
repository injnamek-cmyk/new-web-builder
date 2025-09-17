"use client";

import { useState, useEffect } from "react";
import { usePageStore } from "@/processes/page-store";
import { useWebsiteStore } from "@/processes/website-store";
import { CreatePageRequest, UpdatePageRequest, ValidationError, PageMetadata } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

interface PageFormData {
  title: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

interface PageFormProps {
  initialData?: PageFormData;
  onSubmit: (data: PageFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  validationErrors: ValidationError[];
}

function PageForm({ initialData, onSubmit, onCancel, isLoading, validationErrors }: PageFormProps) {
  const [formData, setFormData] = useState<PageFormData>(
    initialData || {
      title: "",
      path: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    }
  );

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handlePathChange = (value: string) => {
    let path = value;
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    // 경로 정규화: 연속된 슬래시 제거, 소문자 변환
    path = path.replace(/\/+/g, "/").toLowerCase();
    setFormData(prev => ({ ...prev, path }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">페이지 제목</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="페이지 제목을 입력하세요"
          className={getFieldError("title") ? "border-red-500" : ""}
        />
        {getFieldError("title") && (
          <p className="text-sm text-red-500">{getFieldError("title")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="path">URL 경로</Label>
        <Input
          id="path"
          type="text"
          value={formData.path}
          onChange={(e) => handlePathChange(e.target.value)}
          placeholder="/about, /products/new"
          className={getFieldError("path") ? "border-red-500" : ""}
        />
        {getFieldError("path") && (
          <p className="text-sm text-red-500">{getFieldError("path")}</p>
        )}
        <p className="text-sm text-gray-500">
          영문자, 숫자, 하이픈(-), 슬래시(/)만 사용 가능
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaTitle">SEO 제목 (선택사항)</Label>
        <Input
          id="metaTitle"
          type="text"
          value={formData.metaTitle}
          onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
          placeholder="검색 엔진에 표시될 제목"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">SEO 설명 (선택사항)</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
          placeholder="검색 엔진에 표시될 설명"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">키워드 (선택사항)</Label>
        <Input
          id="keywords"
          type="text"
          value={formData.keywords}
          onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
          placeholder="키워드1, 키워드2, 키워드3"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PageManager() {
  const {
    pages,
    isLoading,
    error,
    fetchPages,
    createPage,
    updatePageById,
    deletePageById,
  } = usePageStore();

  const { currentWebsite } = useWebsiteStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (currentWebsite?.id) {
      fetchPages(currentWebsite.id);
    }
  }, [fetchPages, currentWebsite?.id]);

  const handleCreatePage = async (formData: PageFormData) => {
    if (!currentWebsite?.id) {
      setValidationErrors([{ field: "websiteId", message: "웹사이트를 선택해주세요." }]);
      return;
    }

    const pageData: CreatePageRequest = {
      title: formData.title,
      path: formData.path,
      websiteId: currentWebsite.id,
      metadata: {
        title: formData.metaTitle || formData.title,
        description: formData.metaDescription,
        keywords: formData.keywords,
        ogTitle: formData.metaTitle || formData.title,
        ogDescription: formData.metaDescription,
      },
    };

    const result = await createPage(pageData);

    if (result.success) {
      setIsCreateDialogOpen(false);
      setValidationErrors([]);
    } else {
      setValidationErrors(result.validationErrors || []);
    }
  };

  const handleUpdatePage = async (id: string, formData: PageFormData) => {
    const updateData: UpdatePageRequest = {
      title: formData.title,
      path: formData.path,
      metadata: {
        title: formData.metaTitle || formData.title,
        description: formData.metaDescription,
        keywords: formData.keywords,
        ogTitle: formData.metaTitle || formData.title,
        ogDescription: formData.metaDescription,
      },
    };

    const result = await updatePageById(id, updateData);

    if (result.success) {
      setEditingPage(null);
      setValidationErrors([]);
    } else {
      setValidationErrors(result.validationErrors || []);
    }
  };

  const handleDeletePage = async (id: string) => {
    await deletePageById(id);
  };

  const getEditFormData = (pageId: string): PageFormData | undefined => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return undefined;

    const metadata = page.metadata as PageMetadata;
    return {
      title: page.title,
      path: page.path,
      metaTitle: metadata?.title || page.title,
      metaDescription: metadata?.description || "",
      keywords: metadata?.keywords || "",
    };
  };

  if (isLoading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">페이지 관리</h2>
          <p className="text-gray-600">웹사이트의 페이지를 생성하고 관리하세요.</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              새 페이지
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 페이지 생성</DialogTitle>
              <DialogDescription>
                새로운 페이지를 생성하고 기본 설정을 구성하세요.
              </DialogDescription>
            </DialogHeader>
            <PageForm
              onSubmit={handleCreatePage}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setValidationErrors([]);
              }}
              isLoading={isLoading}
              validationErrors={validationErrors}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => {
          const metadata = page.metadata as PageMetadata;
          return (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {page.path}
                    </CardDescription>
                  </div>
                  <Badge variant={page.isPublished ? "default" : "secondary"}>
                    {page.isPublished ? "게시됨" : "비공개"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metadata?.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {metadata.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500">
                    <p>생성: {new Date(page.createdAt).toLocaleDateString()}</p>
                    <p>수정: {new Date(page.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {page.isPublished && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={page.path} target="_blank">
                          <ExternalLinkIcon className="w-3 h-3 mr-1" />
                          미리보기
                        </Link>
                      </Button>
                    )}

                    <Dialog
                      open={editingPage === page.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingPage(null);
                          setValidationErrors([]);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPage(page.id)}
                        >
                          <EditIcon className="w-3 h-3 mr-1" />
                          편집
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>페이지 편집</DialogTitle>
                          <DialogDescription>
                            페이지 정보를 수정하세요.
                          </DialogDescription>
                        </DialogHeader>
                        <PageForm
                          initialData={getEditFormData(page.id)}
                          onSubmit={(formData) => handleUpdatePage(page.id, formData)}
                          onCancel={() => {
                            setEditingPage(null);
                            setValidationErrors([]);
                          }}
                          isLoading={isLoading}
                          validationErrors={validationErrors}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <TrashIcon className="w-3 h-3 mr-1" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>페이지 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 &quot;{page.title}&quot; 페이지를 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePage(page.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <PlusIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 페이지가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            첫 번째 페이지를 생성하여 시작하세요.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            새 페이지 생성
          </Button>
        </div>
      )}
    </div>
  );
}