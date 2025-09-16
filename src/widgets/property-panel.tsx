"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";
import { useEditorStore } from "@/processes/editor-store";
import { createElement, generateId } from "@/shared/lib/element-factory";
import {
  Element,
  TextElement,
  ImageElement,
  ButtonElement,
  ContainerElement,
  AccordionElement,
  CalendarElement,
  ShapeElement,
} from "@/shared/types";
import ShapeProperties from "@/components/shape-properties";
import { getValidPaddingValue } from "@/lib/utils";

export default function PropertyPanel() {
  const {
    canvas,
    updateElement,
    deleteElement,
    addElement,
    addChildToContainer,
    removeChildFromContainer,
    selectElement,
  } = useEditorStore();
  if (!canvas) {
    return null;
  }

  // 타입 자동 추론을 위한 핸들러 함수
  const createAutoTypeHandler = (property: string, elementId: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const value = input.value;
      const inputType = input.type;

      let processedValue: string | number = value;

      // input type에 따라 자동으로 값 변환
      if (inputType === "number") {
        processedValue = value === "" ? 0 : parseFloat(value);
        if (isNaN(processedValue)) processedValue = 0;
      } else if (inputType === "text") {
        // text input에서 "auto" 처리
        if (value === "auto") {
          processedValue = "auto";
        } else {
          const numValue = parseFloat(value);
          processedValue = isNaN(numValue) ? value : numValue;
        }
      }

      updateElement(elementId, { [property]: processedValue });
    };
  };

  // 다중 선택된 경우 속성 패널 비활성화
  if (canvas.selectedElementIds && canvas.selectedElementIds.length === 0) {
    return (
      <Card className="p-2 lg:p-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-4">
          속성
        </h3>
        <p className="text-xs lg:text-sm text-gray-500">
          요소를 선택하여 속성을 편집하세요.
        </p>
      </Card>
    );
  }

  // 다중 선택된 경우 속성 패널 비활성화
  if (canvas.selectedElementIds && canvas.selectedElementIds.length > 1) {
    return (
      <Card className="p-2 lg:p-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-4">
          속성
        </h3>
        <p className="text-xs lg:text-sm text-gray-500">
          다중 선택된 상태입니다. 속성을 편집하려면 하나의 요소만 선택하세요.
        </p>
        <div className="mt-2 text-xs text-gray-400">
          {canvas.selectedElementIds.length}개 요소가 선택됨
        </div>
      </Card>
    );
  }

  // 단일 선택된 경우에만 속성 패널 활성화
  const selectedElement = canvas.elements.find(
    (el) => el.id === canvas.selectedElementIds[0]
  );

  if (!selectedElement) {
    return (
      <Card className="p-2 lg:p-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-4">
          속성
        </h3>
        <p className="text-xs lg:text-sm text-gray-500">
          선택된 요소를 찾을 수 없습니다.
        </p>
      </Card>
    );
  }

  // 자동 타입 추론 핸들러들
  const handleXChange = createAutoTypeHandler("x", selectedElement.id);
  const handleYChange = createAutoTypeHandler("y", selectedElement.id);
  const handleWidthChange = createAutoTypeHandler("width", selectedElement.id);
  const handleHeightChange = createAutoTypeHandler(
    "height",
    selectedElement.id
  );
  const handleZIndexChange = createAutoTypeHandler(
    "zIndex",
    selectedElement.id
  );

  // 일반 속성 변경 핸들러
  const handlePropertyChange = (
    property: string,
    value:
      | string
      | number
      | boolean
      | Date
      | object
      | Array<{ id: string; title: string; content: string }>
  ) => {
    updateElement(selectedElement.id, { [property]: value });
  };

  const handleDelete = () => {
    if (confirm("이 요소를 삭제하시겠습니까?")) {
      deleteElement(selectedElement.id);
    }
  };

  const handleSpacingChange = (
    property: "padding",
    side: "top" | "right" | "bottom" | "left",
    value: string | number
  ) => {
    const safeValue = getValidPaddingValue(value);
    updateElement(selectedElement.id, {
      [property]: {
        ...selectedElement[property],
        [side]: safeValue,
      },
    });
  };

  const renderSpacingControls = (element: Element) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
          패딩
        </h4>
        <div className="grid grid-cols-2 gap-1 lg:gap-2">
          <div>
            <Label htmlFor="padding-top" className="text-xs">
              위
            </Label>
            <Input
              id="padding-top"
              type="number"
              value={element.padding.top}
              onChange={(e) =>
                handleSpacingChange("padding", "top", e.target.value)
              }
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="padding-right" className="text-xs">
              오른쪽
            </Label>
            <Input
              id="padding-right"
              type="number"
              value={element.padding.right}
              onChange={(e) =>
                handleSpacingChange("padding", "right", e.target.value)
              }
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="padding-bottom" className="text-xs">
              아래
            </Label>
            <Input
              id="padding-bottom"
              type="number"
              value={element.padding.bottom}
              onChange={(e) =>
                handleSpacingChange("padding", "bottom", e.target.value)
              }
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="padding-left" className="text-xs">
              왼쪽
            </Label>
            <Input
              id="padding-left"
              type="number"
              value={element.padding.left}
              onChange={(e) =>
                handleSpacingChange("padding", "left", e.target.value)
              }
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextProperties = (element: TextElement) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <Label htmlFor="content" className="text-xs">
          내용
        </Label>
        <Textarea
          id="content"
          value={element.content}
          onChange={(e) => handlePropertyChange("content", e.target.value)}
          className="text-xs min-h-[60px]"
          placeholder="텍스트를 입력하세요"
        />
      </div>

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="fontSize" className="text-xs">
            글자 크기
          </Label>
          <Input
            id="fontSize"
            type="number"
            value={element.fontSize}
            onChange={(e) =>
              handlePropertyChange("fontSize", parseInt(e.target.value))
            }
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="color" className="text-xs">
            색상
          </Label>
          <Input
            id="color"
            type="color"
            value={element.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fontFamily" className="text-xs">
          폰트
        </Label>
        <Select
          value={element.fontFamily}
          onValueChange={(value) => handlePropertyChange("fontFamily", value)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">인터 (Inter)</SelectItem>
            <SelectItem value="Noto Sans KR">
              노토산스 (Noto Sans KR)
            </SelectItem>
            <SelectItem value="Malgun Gothic">
              맑은 고딕 (Malgun Gothic)
            </SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="textAlign" className="text-xs">
            정렬
          </Label>
          <Select
            value={element.textAlign}
            onValueChange={(value) => handlePropertyChange("textAlign", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">왼쪽</SelectItem>
              <SelectItem value="center">가운데</SelectItem>
              <SelectItem value="right">오른쪽</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fontWeight" className="text-xs">
            글자 굵기
          </Label>
          <Select
            value={element.fontWeight}
            onValueChange={(value) => handlePropertyChange("fontWeight", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">보통</SelectItem>
              <SelectItem value="bold">굵게</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="textDecoration" className="text-xs">
            텍스트 장식
          </Label>
          <Select
            value={element.textDecoration || "none"}
            onValueChange={(value) =>
              handlePropertyChange("textDecoration", value)
            }
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">없음</SelectItem>
              <SelectItem value="underline">밑줄</SelectItem>
              <SelectItem value="line-through">취소선</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lineHeight" className="text-xs">
            줄 간격
          </Label>
          <Input
            id="lineHeight"
            type="number"
            step="0.1"
            min="1"
            max="3"
            value={element.lineHeight || 1.5}
            onChange={(e) =>
              handlePropertyChange("lineHeight", parseFloat(e.target.value))
            }
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );

  const renderImageProperties = (element: ImageElement) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          handlePropertyChange("src", src);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="space-y-2 lg:space-y-4">
        <div>
          <Label className="text-xs">이미지 업로드</Label>
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="w-3 h-3 mr-1" />
              파일 선택
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="alt" className="text-xs">
            대체 텍스트
          </Label>
          <Input
            id="alt"
            value={element.alt}
            onChange={(e) => handlePropertyChange("alt", e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-1 lg:gap-2">
          <div>
            <Label htmlFor="objectFit" className="text-xs">
              이미지 맞춤
            </Label>
            <Select
              value={element.objectFit}
              onValueChange={(value) =>
                handlePropertyChange("objectFit", value)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">커버</SelectItem>
                <SelectItem value="contain">포함</SelectItem>
                <SelectItem value="fill">채우기</SelectItem>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="scale-down">축소</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="objectPosition" className="text-xs">
              이미지 위치
            </Label>
            <Select
              value={element.objectPosition || "center"}
              onValueChange={(value) =>
                handlePropertyChange("objectPosition", value)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">가운데</SelectItem>
                <SelectItem value="top">상단</SelectItem>
                <SelectItem value="bottom">하단</SelectItem>
                <SelectItem value="left">왼쪽</SelectItem>
                <SelectItem value="right">오른쪽</SelectItem>
                <SelectItem value="top left">상단 왼쪽</SelectItem>
                <SelectItem value="top right">상단 오른쪽</SelectItem>
                <SelectItem value="bottom left">하단 왼쪽</SelectItem>
                <SelectItem value="bottom right">하단 오른쪽</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs">이미지 필터</Label>
          <div className="grid grid-cols-2 gap-1 lg:gap-2 mt-1">
            <div>
              <Label htmlFor="brightness" className="text-xs text-gray-600">
                밝기 ({element.filter?.brightness || 100}%)
              </Label>
              <Input
                id="brightness"
                type="range"
                min="0"
                max="200"
                value={element.filter?.brightness || 100}
                onChange={(e) =>
                  handlePropertyChange("filter", {
                    ...element.filter,
                    brightness: parseInt(e.target.value),
                  })
                }
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="contrast" className="text-xs text-gray-600">
                대비 ({element.filter?.contrast || 100}%)
              </Label>
              <Input
                id="contrast"
                type="range"
                min="0"
                max="200"
                value={element.filter?.contrast || 100}
                onChange={(e) =>
                  handlePropertyChange("filter", {
                    ...element.filter,
                    contrast: parseInt(e.target.value),
                  })
                }
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="saturate" className="text-xs text-gray-600">
                채도 ({element.filter?.saturate || 100}%)
              </Label>
              <Input
                id="saturate"
                type="range"
                min="0"
                max="200"
                value={element.filter?.saturate || 100}
                onChange={(e) =>
                  handlePropertyChange("filter", {
                    ...element.filter,
                    saturate: parseInt(e.target.value),
                  })
                }
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="blur" className="text-xs text-gray-600">
                흐림 ({element.filter?.blur || 0}px)
              </Label>
              <Input
                id="blur"
                type="range"
                min="0"
                max="10"
                value={element.filter?.blur || 0}
                onChange={(e) =>
                  handlePropertyChange("filter", {
                    ...element.filter,
                    blur: parseInt(e.target.value),
                  })
                }
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderButtonProperties = (element: ButtonElement) => {
    const iconOptions = [
      { value: "none", label: "아이콘 없음" },
      { value: "Home", label: "홈" },
      { value: "User", label: "사용자" },
      { value: "Settings", label: "설정" },
      { value: "Mail", label: "메일" },
      { value: "Phone", label: "전화" },
      { value: "Search", label: "검색" },
      { value: "Download", label: "다운로드" },
      { value: "Upload", label: "업로드" },
      { value: "Heart", label: "하트" },
      { value: "Star", label: "별" },
      { value: "Plus", label: "플러스" },
      { value: "Minus", label: "마이너스" },
      { value: "Check", label: "체크" },
      { value: "X", label: "닫기" },
      { value: "ChevronRight", label: "오른쪽 화살표" },
      { value: "ChevronLeft", label: "왼쪽 화살표" },
      { value: "ArrowRight", label: "오른쪽 화살표 (굵음)" },
      { value: "ArrowLeft", label: "왼쪽 화살표 (굵음)" },
      { value: "ShoppingCart", label: "쇼핑카트" },
      { value: "CreditCard", label: "신용카드" },
    ];

    return (
      <div className="space-y-2 lg:space-y-4">
        <div>
          <Label htmlFor="text" className="text-xs">
            텍스트
          </Label>
          <Input
            id="text"
            value={element.text}
            onChange={(e) => handlePropertyChange("text", e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-1 lg:gap-2">
          <div>
            <Label htmlFor="variant" className="text-xs">
              변형
            </Label>
            <Select
              value={element.variant || "default"}
              onValueChange={(value) => handlePropertyChange("variant", value)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">기본</SelectItem>
                <SelectItem value="destructive">삭제</SelectItem>
                <SelectItem value="outline">아웃라인</SelectItem>
                <SelectItem value="secondary">보조</SelectItem>
                <SelectItem value="ghost">고스트</SelectItem>
                <SelectItem value="link">링크</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="size" className="text-xs">
              크기
            </Label>
            <Select
              value={element.size || "default"}
              onValueChange={(value) => handlePropertyChange("size", value)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">small</SelectItem>
                <SelectItem value="default">medium</SelectItem>
                <SelectItem value="lg">large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 lg:gap-2">
          <div>
            <Label htmlFor="icon" className="text-xs">
              아이콘
            </Label>
            <Select
              value={element.icon || "none"}
              onValueChange={(value) =>
                handlePropertyChange("icon", value === "none" ? "" : value)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="아이콘 선택" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="iconPosition" className="text-xs">
              아이콘 위치
            </Label>
            <Select
              value={element.iconPosition || "left"}
              onValueChange={(value) =>
                handlePropertyChange("iconPosition", value)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">왼쪽</SelectItem>
                <SelectItem value="right">오른쪽</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="href" className="text-xs">
            링크 (선택사항)
          </Label>
          <Input
            id="href"
            value={element.href || ""}
            onChange={(e) => handlePropertyChange("href", e.target.value)}
            placeholder="https://example.com"
            className="text-xs"
          />
        </div>
      </div>
    );
  };

  const renderContainerProperties = (element: ContainerElement) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <Label htmlFor="backgroundColor" className="text-xs">
          배경색
        </Label>
        <Input
          id="backgroundColor"
          type="color"
          value={element.backgroundColor}
          onChange={(e) =>
            handlePropertyChange("backgroundColor", e.target.value)
          }
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="borderRadius" className="text-xs">
            모서리 둥글기
          </Label>
          <Input
            id="borderRadius"
            type="number"
            value={element.borderRadius}
            onChange={(e) =>
              handlePropertyChange("borderRadius", parseInt(e.target.value))
            }
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="boxShadow" className="text-xs">
            그림자
          </Label>
          <Select
            value={element.boxShadow || "none"}
            onValueChange={(value) => handlePropertyChange("boxShadow", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">없음</SelectItem>
              <SelectItem value="sm">소 (sm)</SelectItem>
              <SelectItem value="md">중 (md)</SelectItem>
              <SelectItem value="lg">대 (lg)</SelectItem>
              <SelectItem value="xl">특대 (xl)</SelectItem>
              <SelectItem value="2xl">최대 (2xl)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">테두리</Label>
        <div className="grid grid-cols-3 gap-1 lg:gap-2 mt-1">
          <div>
            <Label htmlFor="borderStyle" className="text-xs text-gray-600">
              스타일
            </Label>
            <Select
              value={element.borderStyle || "none"}
              onValueChange={(value) =>
                handlePropertyChange("borderStyle", value)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="solid">실선</SelectItem>
                <SelectItem value="dashed">점선</SelectItem>
                <SelectItem value="dotted">점선 (둔)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="borderWidth" className="text-xs text-gray-600">
              두께 (px)
            </Label>
            <Input
              id="borderWidth"
              type="number"
              min="0"
              max="10"
              value={element.borderWidth || 0}
              onChange={(e) =>
                handlePropertyChange("borderWidth", parseInt(e.target.value))
              }
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="borderColor" className="text-xs text-gray-600">
              색상
            </Label>
            <Input
              id="borderColor"
              type="color"
              value={element.borderColor || "#000000"}
              onChange={(e) =>
                handlePropertyChange("borderColor", e.target.value)
              }
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* 하이브리드 레이아웃 설정 */}
      <div className="border-t pt-3 lg:pt-4">
        <Label className="text-xs font-medium">레이아웃 모드</Label>
        <Select
          value={element.layoutMode || "absolute"}
          onValueChange={(value) => handlePropertyChange("layoutMode", value)}
        >
          <SelectTrigger className="text-xs mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="absolute">절대 위치 (기본)</SelectItem>
            <SelectItem value="flex">플렉스 박스</SelectItem>
            <SelectItem value="grid">그리드</SelectItem>
            <SelectItem value="flow">플로우</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 레이아웃별 상세 설정 */}
      {element.layoutMode === "flex" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">플렉스 설정</Label>
          <div className="grid grid-cols-2 gap-1 lg:gap-2">
            <div>
              <Label htmlFor="flexDirection" className="text-xs text-gray-600">
                방향
              </Label>
              <Select
                value={element.flex?.flexDirection || "row"}
                onValueChange={(value) =>
                  handlePropertyChange("flex", {
                    ...element.flex,
                    flexDirection: value,
                  })
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">가로</SelectItem>
                  <SelectItem value="column">세로</SelectItem>
                  <SelectItem value="row-reverse">가로 역순</SelectItem>
                  <SelectItem value="column-reverse">세로 역순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="justifyContent" className="text-xs text-gray-600">
                정렬 (주축)
              </Label>
              <Select
                value={element.flex?.justifyContent || "flex-start"}
                onValueChange={(value) =>
                  handlePropertyChange("flex", {
                    ...element.flex,
                    justifyContent: value,
                  })
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">시작</SelectItem>
                  <SelectItem value="center">중앙</SelectItem>
                  <SelectItem value="flex-end">끝</SelectItem>
                  <SelectItem value="space-between">간격</SelectItem>
                  <SelectItem value="space-around">둘러싸기</SelectItem>
                  <SelectItem value="space-evenly">균등</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 lg:gap-2">
            <div>
              <Label htmlFor="alignItems" className="text-xs text-gray-600">
                정렬 (교차축)
              </Label>
              <Select
                value={element.flex?.alignItems || "stretch"}
                onValueChange={(value) =>
                  handlePropertyChange("flex", {
                    ...element.flex,
                    alignItems: value,
                  })
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">늘이기</SelectItem>
                  <SelectItem value="flex-start">시작</SelectItem>
                  <SelectItem value="center">중앙</SelectItem>
                  <SelectItem value="flex-end">끝</SelectItem>
                  <SelectItem value="baseline">기준선</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gap" className="text-xs text-gray-600">
                간격 (px)
              </Label>
              <Input
                id="gap"
                type="number"
                min="0"
                value={element.gap || 0}
                onChange={(e) =>
                  handlePropertyChange("gap", parseInt(e.target.value) || 0)
                }
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {element.layoutMode === "grid" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">그리드 설정</Label>
          <div className="grid grid-cols-2 gap-1 lg:gap-2">
            <div>
              <Label htmlFor="gridColumns" className="text-xs text-gray-600">
                컬럼 개수
              </Label>
              <Input
                id="gridColumns"
                type="number"
                min="1"
                max="12"
                value={element.grid?.gridColumns || 2}
                onChange={(e) =>
                  handlePropertyChange("grid", {
                    ...element.grid,
                    gridColumns: parseInt(e.target.value) || 2,
                  })
                }
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="gridRows" className="text-xs text-gray-600">
                행 개수
              </Label>
              <Select
                value={element.grid?.gridRows?.toString() || "auto"}
                onValueChange={(value) =>
                  handlePropertyChange("grid", {
                    ...element.grid,
                    gridRows: value === "auto" ? "auto" : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">자동</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="gridGap" className="text-xs text-gray-600">
              간격 (px)
            </Label>
            <Input
              id="gridGap"
              type="number"
              min="0"
              value={element.gap || element.grid?.gridGap || 0}
              onChange={(e) =>
                handlePropertyChange("gap", parseInt(e.target.value) || 0)
              }
              className="text-xs"
            />
          </div>
        </div>
      )}

      {/* 자식 요소 관리 */}
      <div className="border-t pt-3 lg:pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">
            자식 요소 ({element.children?.length || 0}개)
          </Label>
          <Select
            value=""
            onValueChange={(elementType) => {
              if (elementType) {
                const newId = generateId();
                const newElement = createElement(
                  elementType as any,
                  newId,
                  0,
                  0
                );
                // 자식 요소는 캔버스에 독립적으로 추가하지 않고, 컨테이너에만 추가
                addElement(newElement);
                addChildToContainer(element.id, newId);
                // 부모 컨테이너를 다시 선택
                selectElement(element.id);
              }
            }}
          >
            <SelectTrigger className="w-[140px] text-xs h-7">
              <SelectValue placeholder="요소 추가" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">텍스트</SelectItem>
              <SelectItem value="button">버튼</SelectItem>
              <SelectItem value="image">이미지</SelectItem>
              <SelectItem value="container">컨테이너</SelectItem>
              <SelectItem value="accordion">아코디언</SelectItem>
              <SelectItem value="calendar">캘린더</SelectItem>
              <SelectItem value="shape">도형</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {element.children && element.children.length > 0 && (
          <div className="mt-2 space-y-1">
            {element.children.map((childId) => {
              const childElement = canvas.elements.find(
                (el) => el.id === childId
              );
              return (
                <div
                  key={childId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                >
                  <span>
                    {childElement?.type || "Unknown"} - {childId.slice(0, 8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeChildFromContainer(element.id, childId)
                    }
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {(!element.children || element.children.length === 0) && (
          <div className="text-xs text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded">
            위의 드롭다운에서 자식 요소를 추가하세요
          </div>
        )}
      </div>
    </div>
  );

  const renderCommonProperties = (element: Element) => (
    <div className="space-y-2 lg:space-y-4">
      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="x" className="text-xs">
            X 위치
          </Label>
          <Input
            id="x"
            type="number"
            value={element.x}
            onChange={handleXChange}
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="y" className="text-xs">
            Y 위치
          </Label>
          <Input
            id="y"
            type="number"
            value={element.y}
            onChange={handleYChange}
            className="text-xs"
          />
        </div>
      </div>

      {element.type !== "button" && (
        <div className="grid grid-cols-2 gap-1 lg:gap-2">
          <div>
            <Label htmlFor="width" className="text-xs">
              너비
            </Label>
            <Input
              id="width"
              type="text"
              placeholder="auto 또는 숫자"
              value={
                element.width === "auto" ? "auto" : element.width.toString()
              }
              onChange={handleWidthChange}
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">
              높이
            </Label>
            <Input
              id="height"
              type="text"
              placeholder="auto 또는 숫자"
              value={
                element.height === "auto" ? "auto" : element.height.toString()
              }
              onChange={handleHeightChange}
              className="text-xs"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="zIndex" className="text-xs">
          Z 순서
        </Label>
        <Input
          id="zIndex"
          type="number"
          value={element.zIndex}
          onChange={handleZIndexChange}
          className="text-xs"
        />
      </div>
    </div>
  );

  const renderAccordionProperties = (element: AccordionElement) => {
    const addAccordionItem = () => {
      const newItem = {
        id: `item-${Date.now()}`,
        title: `새 아이템 ${element.items.length + 1}`,
        content: "내용을 입력하세요",
      };
      handlePropertyChange("items", [...element.items, newItem]);
    };

    const removeAccordionItem = (itemId: string) => {
      const updatedItems = element.items.filter((item) => item.id !== itemId);
      handlePropertyChange("items", updatedItems);
    };

    const updateAccordionItem = (
      itemId: string,
      field: "title" | "content",
      value: string
    ) => {
      const updatedItems = element.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      handlePropertyChange("items", updatedItems);
    };

    return (
      <div className="space-y-2 lg:space-y-4">
        <div>
          <Label className="text-xs">아코디언 설정</Label>
          <div className="grid grid-cols-2 gap-1 lg:gap-2 mt-1 lg:mt-2">
            <div>
              <Label className="text-xs text-gray-600">변형</Label>
              <Select
                value={element.variant || "default"}
                onValueChange={(value) =>
                  updateElement(element.id, {
                    variant: value as "default" | "outline" | "ghost",
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">기본</SelectItem>
                  <SelectItem value="outline">아웃라인</SelectItem>
                  <SelectItem value="ghost">고스트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-600">유형</Label>
              <Select
                value={element.accordionType || "single"}
                onValueChange={(value) =>
                  handlePropertyChange("accordionType", value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">단일 선택</SelectItem>
                  <SelectItem value="multiple">다중 선택</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="collapsible"
                checked={element.collapsible || false}
                onChange={(e) =>
                  updateElement(element.id, { collapsible: e.target.checked })
                }
              />
              <Label htmlFor="collapsible" className="text-xs">
                접기 가능
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="disabled"
                checked={element.disabled || false}
                onChange={(e) =>
                  updateElement(element.id, { disabled: e.target.checked })
                }
              />
              <Label htmlFor="disabled" className="text-xs">
                비활성화
              </Label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">아코디언 아이템</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addAccordionItem}
              className="h-6 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              추가
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {element.items.map((item, index) => (
              <div key={item.id} className="border rounded p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    아이템 {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccordionItem(item.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">제목</Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateAccordionItem(item.id, "title", e.target.value)
                    }
                    className="text-xs"
                    placeholder="제목을 입력하세요"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">내용</Label>
                  <Textarea
                    value={item.content}
                    onChange={(e) =>
                      updateAccordionItem(item.id, "content", e.target.value)
                    }
                    className="text-xs min-h-[60px]"
                    placeholder="내용을 입력하세요"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarProperties = (element: CalendarElement) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <Label className="text-xs">캘린더 설정</Label>
        <div className="grid grid-cols-2 gap-1 lg:gap-2 mt-1 lg:mt-2">
          <div>
            <Label className="text-xs text-gray-600">모드</Label>
            <Select
              value={element.mode || "single"}
              onValueChange={(value) =>
                updateElement(element.id, {
                  mode: value as "single" | "range" | "multiple",
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">단일 선택</SelectItem>
                <SelectItem value="range">범위 선택</SelectItem>
                <SelectItem value="multiple">다중 선택</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-600">주 시작일</Label>
            <Select
              value={(element.weekStartsOn || 0).toString()}
              onValueChange={(value) =>
                handlePropertyChange("weekStartsOn", parseInt(value))
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">일요일</SelectItem>
                <SelectItem value="1">월요일</SelectItem>
                <SelectItem value="2">화요일</SelectItem>
                <SelectItem value="3">수요일</SelectItem>
                <SelectItem value="4">목요일</SelectItem>
                <SelectItem value="5">금요일</SelectItem>
                <SelectItem value="6">토요일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOutsideDays"
              checked={element.showOutsideDays || false}
              onChange={(e) =>
                updateElement(element.id, { showOutsideDays: e.target.checked })
              }
            />
            <Label htmlFor="showOutsideDays" className="text-xs">
              외부 날짜 표시
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fixedWeeks"
              checked={element.fixedWeeks || false}
              onChange={(e) =>
                updateElement(element.id, { fixedWeeks: e.target.checked })
              }
            />
            <Label htmlFor="fixedWeeks" className="text-xs">
              고정 주 수
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disabled"
              checked={element.disabled || false}
              onChange={(e) =>
                updateElement(element.id, { disabled: e.target.checked })
              }
            />
            <Label htmlFor="disabled" className="text-xs">
              비활성화
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="defaultMonth" className="text-xs text-gray-600">
            기본 달 (YYYY-MM 형식)
          </Label>
          <Input
            id="defaultMonth"
            type="month"
            value={
              element.defaultMonth
                ? `${element.defaultMonth.getFullYear()}-${(
                    element.defaultMonth.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, "0")}`
                : `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}`
            }
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
              handlePropertyChange("defaultMonth", date);
            }}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );

  const renderSpecificProperties = () => {
    switch (selectedElement.type) {
      case "text":
        return renderTextProperties(selectedElement);
      case "image":
        return renderImageProperties(selectedElement);
      case "button":
        return renderButtonProperties(selectedElement);
      case "container":
        return renderContainerProperties(selectedElement);
      case "accordion":
        return renderAccordionProperties(selectedElement);
      case "calendar":
        return renderCalendarProperties(selectedElement);
      case "shape":
        return <ShapeProperties element={selectedElement as ShapeElement} />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-2 lg:p-4">
      <div className="flex items-center justify-between mb-2 lg:mb-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-700">속성</h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-xs lg:text-sm"
        >
          삭제
        </button>
      </div>

      <div className="space-y-3 lg:space-y-6">
        {renderSpecificProperties()}
        {selectedElement.type !== "button" && renderSpacingControls(selectedElement)}
        {renderCommonProperties(selectedElement)}
      </div>
    </Card>
  );
}
