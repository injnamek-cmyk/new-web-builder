"use client";

import { useState } from "react";
import { PageMetadata } from "@/shared/types";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, ShareIcon, EyeIcon } from "lucide-react";

interface SEOManagerProps {
  metadata: PageMetadata;
  onChange: (metadata: PageMetadata) => void;
  pageTitle: string;
  pagePath: string;
}

export function SEOManager({ metadata, onChange, pageTitle, pagePath }: SEOManagerProps) {
  const [localMetadata, setLocalMetadata] = useState<PageMetadata>(metadata);

  const handleChange = (field: keyof PageMetadata, value: string) => {
    const updatedMetadata = { ...localMetadata, [field]: value };
    setLocalMetadata(updatedMetadata);
    onChange(updatedMetadata);
  };

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length;
    const isOverLimit = count > limit;
    return (
      <span className={`text-xs ${isOverLimit ? "text-red-500" : "text-gray-500"}`}>
        {count}/{limit}
      </span>
    );
  };

  const getPreviewUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${pagePath}`;
    }
    return pagePath;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">SEO 메타데이터 관리</h3>
        <p className="text-sm text-gray-600">
          검색 엔진 최적화를 위한 메타데이터를 설정하세요.
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <SearchIcon className="w-4 h-4" />
            기본 SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <ShareIcon className="w-4 h-4" />
            소셜 미디어
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            미리보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>검색 엔진 설정</CardTitle>
              <CardDescription>
                Google, Bing 등 검색 엔진에서 표시될 정보를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">페이지 제목</Label>
                <Input
                  id="seo-title"
                  type="text"
                  value={localMetadata.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder={pageTitle}
                  className="pr-16"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    비어있으면 페이지 제목이 사용됩니다.
                  </p>
                  {getCharacterCount(localMetadata.title, 60)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">페이지 설명</Label>
                <Textarea
                  id="seo-description"
                  value={localMetadata.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="이 페이지에 대한 간단한 설명을 입력하세요."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    검색 결과에 표시될 설명입니다.
                  </p>
                  {getCharacterCount(localMetadata.description || "", 160)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">키워드</Label>
                <Input
                  id="seo-keywords"
                  type="text"
                  value={localMetadata.keywords || ""}
                  onChange={(e) => handleChange("keywords", e.target.value)}
                  placeholder="키워드1, 키워드2, 키워드3"
                />
                <p className="text-xs text-gray-500">
                  쉼표로 구분된 키워드를 입력하세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>소셜 미디어 설정</CardTitle>
              <CardDescription>
                Facebook, Twitter 등에서 공유될 때의 모양을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og-title">Open Graph 제목</Label>
                <Input
                  id="og-title"
                  type="text"
                  value={localMetadata.ogTitle || ""}
                  onChange={(e) => handleChange("ogTitle", e.target.value)}
                  placeholder={localMetadata.title || pageTitle}
                />
                <p className="text-xs text-gray-500">
                  비어있으면 SEO 제목이 사용됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-description">Open Graph 설명</Label>
                <Textarea
                  id="og-description"
                  value={localMetadata.ogDescription || ""}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  placeholder={localMetadata.description || ""}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  비어있으면 SEO 설명이 사용됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-image">Open Graph 이미지 URL</Label>
                <Input
                  id="og-image"
                  type="url"
                  value={localMetadata.ogImage || ""}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500">
                  소셜 미디어에서 표시될 이미지 URL을 입력하세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google 검색 결과 미리보기</CardTitle>
              <CardDescription>
                Google 검색에서 이 페이지가 어떻게 표시될지 미리보기입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer mb-1">
                  {localMetadata.title || pageTitle}
                </div>
                <div className="text-green-700 text-sm mb-2">
                  {getPreviewUrl()}
                </div>
                <div className="text-gray-700 text-sm">
                  {localMetadata.description || "설명이 없습니다."}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>소셜 미디어 미리보기</CardTitle>
              <CardDescription>
                Facebook, Twitter 등에서 공유될 때의 모양입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white max-w-md">
                {localMetadata.ogImage && (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={localMetadata.ogImage}
                      alt="OG Image preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="font-semibold text-gray-900 mb-1">
                    {localMetadata.ogTitle || localMetadata.title || pageTitle}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {localMetadata.ogDescription || localMetadata.description || ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getPreviewUrl()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Badge variant="outline" className="text-xs">
          SEO 점수: {localMetadata.title && localMetadata.description ? "좋음" : "개선 필요"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          제목 길이: {localMetadata.title.length <= 60 ? "적절" : "너무 김"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          설명 길이: {(localMetadata.description?.length || 0) <= 160 ? "적절" : "너무 김"}
        </Badge>
      </div>
    </div>
  );
}