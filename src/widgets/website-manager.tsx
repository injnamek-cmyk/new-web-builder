"use client";

import { useState, useEffect } from "react";
import { useWebsiteStore } from "@/processes/website-store";
import { CreateWebsiteRequest, UpdateWebsiteRequest, ValidationError } from "@/shared/types";
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
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

interface WebsiteFormData {
  name: string;
  description: string;
  subdomain: string;
  domain: string;
}

interface WebsiteFormProps {
  initialData?: WebsiteFormData;
  onSubmit: (data: WebsiteFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  validationErrors: ValidationError[];
}

function WebsiteForm({ initialData, onSubmit, onCancel, isLoading, validationErrors }: WebsiteFormProps) {
  const [formData, setFormData] = useState<WebsiteFormData>(
    initialData || {
      name: "",
      description: "",
      subdomain: "",
      domain: "",
    }
  );

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleSubdomainChange = (value: string) => {
    // 서브도메인은 소문자, 숫자, 하이픈만 허용
    const subdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData(prev => ({ ...prev, subdomain }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">웹사이트 이름</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="웹사이트 이름을 입력하세요"
          className={getFieldError("name") ? "border-red-500" : ""}
        />
        {getFieldError("name") && (
          <p className="text-sm text-red-500">{getFieldError("name")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">서브도메인</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="subdomain"
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            placeholder="my-website"
            className={getFieldError("subdomain") ? "border-red-500 flex-1" : "flex-1"}
          />
          <span className="text-sm text-gray-500">.yourdomain.com</span>
        </div>
        {getFieldError("subdomain") && (
          <p className="text-sm text-red-500">{getFieldError("subdomain")}</p>
        )}
        <p className="text-sm text-gray-500">
          3-63자의 영문자, 숫자, 하이픈만 사용 가능
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">커스텀 도메인 (선택사항)</Label>
        <Input
          id="domain"
          type="text"
          value={formData.domain}
          onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
          placeholder="www.example.com"
          className={getFieldError("domain") ? "border-red-500" : ""}
        />
        {getFieldError("domain") && (
          <p className="text-sm text-red-500">{getFieldError("domain")}</p>
        )}
        <p className="text-sm text-gray-500">
          자체 도메인을 사용하려면 입력하세요
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명 (선택사항)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="웹사이트에 대한 설명을 입력하세요"
          rows={3}
          className={getFieldError("description") ? "border-red-500" : ""}
        />
        {getFieldError("description") && (
          <p className="text-sm text-red-500">{getFieldError("description")}</p>
        )}
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

export function WebsiteManager() {
  const {
    websites,
    isLoading,
    error,
    fetchWebsites,
    createWebsite,
    updateWebsiteById,
    deleteWebsiteById,
  } = useWebsiteStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleCreateWebsite = async (formData: WebsiteFormData) => {
    const websiteData: CreateWebsiteRequest = {
      name: formData.name,
      description: formData.description || undefined,
      subdomain: formData.subdomain,
      domain: formData.domain || undefined,
    };

    const result = await createWebsite(websiteData);

    if (result.success) {
      setIsCreateDialogOpen(false);
      setValidationErrors([]);
    } else {
      setValidationErrors(result.validationErrors || []);
    }
  };

  const handleUpdateWebsite = async (id: string, formData: WebsiteFormData) => {
    const updateData: UpdateWebsiteRequest = {
      name: formData.name,
      description: formData.description || undefined,
      subdomain: formData.subdomain,
      domain: formData.domain || undefined,
    };

    const result = await updateWebsiteById(id, updateData);

    if (result.success) {
      setEditingWebsite(null);
      setValidationErrors([]);
    } else {
      setValidationErrors(result.validationErrors || []);
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    await deleteWebsiteById(id);
  };

  const getEditFormData = (websiteId: string): WebsiteFormData | undefined => {
    const website = websites.find(w => w.id === websiteId);
    if (!website) return undefined;

    return {
      name: website.name,
      description: website.description || "",
      subdomain: website.subdomain,
      domain: website.domain || "",
    };
  };

  if (isLoading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">웹사이트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">웹사이트 관리</h2>
          <p className="text-gray-600">여러 웹사이트를 생성하고 관리하세요.</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              새 웹사이트
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 웹사이트 생성</DialogTitle>
              <DialogDescription>
                새로운 웹사이트를 생성하고 기본 설정을 구성하세요.
              </DialogDescription>
            </DialogHeader>
            <WebsiteForm
              onSubmit={handleCreateWebsite}
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
        {websites.map((website) => (
          <Card key={website.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{website.name}</CardTitle>
                  <CardDescription className="font-mono text-sm">
                    {website.subdomain}.yourdomain.com
                  </CardDescription>
                  {website.domain && (
                    <CardDescription className="font-mono text-sm text-green-600">
                      {website.domain}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={website.isPublished ? "default" : "secondary"}>
                  {website.isPublished ? "게시됨" : "비공개"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {website.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {website.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  <p>생성: {new Date(website.createdAt).toLocaleDateString()}</p>
                  <p>수정: {new Date(website.updatedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/editor/${website.id}`}>
                      <SettingsIcon className="w-3 h-3 mr-1" />
                      에디터
                    </Link>
                  </Button>

                  {website.isPublished && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${website.subdomain}`} target="_blank">
                        <ExternalLinkIcon className="w-3 h-3 mr-1" />
                        방문
                      </Link>
                    </Button>
                  )}

                  <Dialog
                    open={editingWebsite === website.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingWebsite(null);
                        setValidationErrors([]);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWebsite(website.id)}
                      >
                        <EditIcon className="w-3 h-3 mr-1" />
                        편집
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>웹사이트 편집</DialogTitle>
                        <DialogDescription>
                          웹사이트 정보를 수정하세요.
                        </DialogDescription>
                      </DialogHeader>
                      <WebsiteForm
                        initialData={getEditFormData(website.id)}
                        onSubmit={(formData) => handleUpdateWebsite(website.id, formData)}
                        onCancel={() => {
                          setEditingWebsite(null);
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
                        <AlertDialogTitle>웹사이트 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 &quot;{website.name}&quot; 웹사이트를 삭제하시겠습니까?
                          이 작업은 되돌릴 수 없으며, 모든 페이지도 함께 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteWebsite(website.id)}
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
        ))}
      </div>

      {websites.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <PlusIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 웹사이트가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            첫 번째 웹사이트를 생성하여 시작하세요.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            새 웹사이트 생성
          </Button>
        </div>
      )}
    </div>
  );
}