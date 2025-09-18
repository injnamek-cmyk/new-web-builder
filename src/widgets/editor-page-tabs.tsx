"use client";

import { useState, useEffect, useCallback } from "react";
import { usePageStore } from "@/processes/page-store";
import { useWebsiteStore } from "@/processes/website-store";
import {
  CreatePageRequest,
  UpdatePageRequest,
  ValidationError,
  Page,
} from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  FileIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageFormData {
  title: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

interface PageFormProps {
  websiteId: string;
  initialData?: PageFormData;
  onSubmit: (data: PageFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  validationErrors: ValidationError[];
}

function PageForm({
  websiteId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  validationErrors,
}: PageFormProps) {
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
    return validationErrors.find((error) => error.field === field)?.message;
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
    path = path.replace(/\/+/g, "/").toLowerCase();
    setFormData((prev) => ({ ...prev, path }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">페이지 제목</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaTitle">SEO 제목 (선택사항)</Label>
        <Input
          id="metaTitle"
          type="text"
          value={formData.metaTitle}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
          }
          placeholder="검색 엔진에 표시될 제목"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">SEO 설명 (선택사항)</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              metaDescription: e.target.value,
            }))
          }
          placeholder="검색 엔진에 표시될 설명"
          rows={3}
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

interface EditorPageTabsProps {
  websiteId: string;
  currentPageId?: string;
  onPageSelect?: (page: Page | null) => void;
}

export function EditorPageTabs({
  websiteId,
  currentPageId,
  onPageSelect,
}: EditorPageTabsProps) {
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
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  useEffect(() => {
    if (websiteId) {
      fetchPages(websiteId);
    }
  }, [websiteId, fetchPages]);

  const handleCreatePage = async (formData: PageFormData) => {
    const pageData: CreatePageRequest = {
      title: formData.title,
      path: formData.path,
      websiteId,
      metadata: {
        title: formData.metaTitle || formData.title,
        description: formData.metaDescription,
        keywords: formData.keywords,
        ogTitle: formData.metaTitle || formData.title,
        ogDescription: formData.metaDescription,
      },
    };

    const result = await createPage(pageData);

    if (result.success && result.data) {
      setIsCreateDialogOpen(false);
      setValidationErrors([]);
      if (onPageSelect) {
        onPageSelect(result.data);
      }
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
    const wasActive = currentPageId === id;
    await deletePageById(id);
    if (wasActive && onPageSelect) {
      // Let the parent component handle selecting a new page
      // by notifying that the current selection is gone.
      onPageSelect(null);
    }
  };

  const getEditFormData = (pageId: string): PageFormData | undefined => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return undefined;

    const metadata = page.metadata;
    return {
      title: page.title,
      path: page.path,
      metaTitle: metadata?.title || page.title,
      metaDescription: metadata?.description || "",
      keywords: metadata?.keywords || "",
    };
  };

  const getWebsiteUrl = () => {
    if (!currentWebsite) return "";
    return (
      currentWebsite.domain || `${currentWebsite.subdomain}.yourdomain.com`
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">
          페이지를 불러오는 중 오류가 발생했습니다: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">페이지 관리</h3>
            <p className="text-sm text-gray-600">
              {currentWebsite ? currentWebsite.name : "웹사이트"} 페이지들
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="w-4 h-4 mr-1" />새 페이지
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
                websiteId={websiteId}
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
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                currentPageId === page.id
                  ? "bg-blue-100 border border-blue-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onPageSelect && onPageSelect(page)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {page.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{page.path}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge
                    variant={page.isPublished ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {page.isPublished ? "게시" : "비공개"}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVerticalIcon className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {page.isPublished && (
                    <DropdownMenuItem asChild>
                      <a
                        href={`//${getWebsiteUrl()}${page.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLinkIcon className="w-3 h-3 mr-2" />
                        미리보기
                      </a>
                    </DropdownMenuItem>
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
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setEditingPage(page.id);
                        }}
                      >
                        <EditIcon className="w-3 h-3 mr-2" />
                        편집
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>페이지 편집</DialogTitle>
                        <DialogDescription>
                          페이지 정보를 수정하세요.
                        </DialogDescription>
                      </DialogHeader>
                      <PageForm
                        websiteId={websiteId}
                        initialData={getEditFormData(page.id)}
                        onSubmit={(formData) =>
                          handleUpdatePage(page.id, formData)
                        }
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
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600"
                      >
                        <TrashIcon className="w-3 h-3 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>페이지 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 &quot;{page.title}&quot; 페이지를
                          삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {pages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FileIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                아직 페이지가 없습니다
              </p>
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />첫 페이지 생성
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">
                페이지를 불러오는 중...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
