"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Palette } from "lucide-react";
import { ShapeElement, ShapeBackground } from "@/shared/types";
import { useEditorStore } from "@/processes/editor-store";

interface ShapePropertiesProps {
  element: ShapeElement;
}

export default function ShapeProperties({ element }: ShapePropertiesProps) {
  const { updateElement } = useEditorStore();

  const handleBackgroundTypeChange = (value: string) => {
    const type = value as "color" | "image";
    const newBackground: ShapeBackground = {
      type,
      ...(type === "color"
        ? { color: element.background.color || "#3b82f6" }
        : {
            imageUrl: element.background.imageUrl || "",
            imageSize: element.background.imageSize || "cover",
            imagePosition: element.background.imagePosition || "center",
          }),
    };

    updateElement(element.id, { background: newBackground });
  };

  const handleColorChange = (color: string) => {
    updateElement(element.id, {
      background: { ...element.background, color },
    });
  };

  const handleBorderColorChange = (borderColor: string) => {
    updateElement(element.id, { borderColor });
  };

  const handleBorderWidthChange = (borderWidth: number) => {
    updateElement(element.id, { borderWidth });
  };

  const handleBorderStyleChange = (
    borderStyle: "solid" | "dashed" | "dotted" | "none"
  ) => {
    updateElement(element.id, { borderStyle });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 임시로 로컬 URL 생성 (실제로는 서버에 업로드해야 함)
    const imageUrl = URL.createObjectURL(file);

    updateElement(element.id, {
      background: {
        ...element.background,
        type: "image",
        imageUrl,
        imageSize: element.background.imageSize || "cover",
        imagePosition: element.background.imagePosition || "center",
      },
    });
  };

  const handleImageSizeChange = (
    imageSize: "cover" | "contain" | "stretch" | "repeat"
  ) => {
    updateElement(element.id, {
      background: { ...element.background, imageSize },
    });
  };

  const handleImagePositionChange = (
    imagePosition:
      | "center"
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top left"
      | "top right"
      | "bottom left"
      | "bottom right"
  ) => {
    updateElement(element.id, {
      background: { ...element.background, imagePosition },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">도형 스타일</h3>

        {/* 배경 설정 */}
        <div className="space-y-4">
          <div>
            <Label>배경 타입</Label>
            <Tabs
              value={element.background.type}
              onValueChange={handleBackgroundTypeChange}
              className="mt-2"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="color" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  색상
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  이미지
                </TabsTrigger>
              </TabsList>

              <TabsContent value="color" className="space-y-3">
                <div>
                  <Label>배경색</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={element.background.color || "#3b82f6"}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-12 h-10 p-1 border"
                    />
                    <Input
                      type="text"
                      value={element.background.color || "#3b82f6"}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-3">
                <div>
                  <Label>이미지 업로드</Label>
                  <div className="mt-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  {element.background.imageUrl && (
                    <div className="mt-2">
                      <Image
                        src={element.background.imageUrl}
                        alt="배경 이미지 미리보기"
                        width={300}
                        height={80}
                        className="w-full h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>이미지 크기</Label>
                  <Select
                    value={element.background.imageSize || "cover"}
                    onValueChange={handleImageSizeChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">덮기 (Cover)</SelectItem>
                      <SelectItem value="contain">맞춤 (Contain)</SelectItem>
                      <SelectItem value="stretch">늘리기 (Stretch)</SelectItem>
                      <SelectItem value="repeat">반복 (Repeat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>이미지 위치</Label>
                  <Select
                    value={element.background.imagePosition || "center"}
                    onValueChange={handleImagePositionChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">중앙</SelectItem>
                      <SelectItem value="top">위</SelectItem>
                      <SelectItem value="bottom">아래</SelectItem>
                      <SelectItem value="left">왼쪽</SelectItem>
                      <SelectItem value="right">오른쪽</SelectItem>
                      <SelectItem value="top left">왼쪽 위</SelectItem>
                      <SelectItem value="top right">오른쪽 위</SelectItem>
                      <SelectItem value="bottom left">왼쪽 아래</SelectItem>
                      <SelectItem value="bottom right">오른쪽 아래</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 테두리 설정 */}
          <div className="space-y-3">
            <div>
              <Label>테두리 색상</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={element.borderColor}
                  onChange={(e) => handleBorderColorChange(e.target.value)}
                  className="w-12 h-10 p-1 border"
                />
                <Input
                  type="text"
                  value={element.borderColor}
                  onChange={(e) => handleBorderColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>테두리 굵기</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="range"
                  min="0"
                  max="20"
                  value={element.borderWidth}
                  onChange={(e) =>
                    handleBorderWidthChange(Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-8">
                  {element.borderWidth}px
                </span>
              </div>
            </div>

            <div>
              <Label>테두리 스타일</Label>
              <Select
                value={element.borderStyle}
                onValueChange={handleBorderStyleChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">실선</SelectItem>
                  <SelectItem value="dashed">점선</SelectItem>
                  <SelectItem value="dotted">도트</SelectItem>
                  <SelectItem value="none">없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
