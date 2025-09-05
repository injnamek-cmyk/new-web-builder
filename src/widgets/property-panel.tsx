"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/processes/editor-store";
import {
  Element,
  TextElement,
  ImageElement,
  ButtonElement,
  ContainerElement,
  AccordionElement,
  CalendarElement,
} from "@/shared/types";
import { getValidPaddingValue } from "@/lib/utils";

export default function PropertyPanel() {
  const { canvas, updateElement, deleteElement } = useEditorStore();

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
  if (canvas.selectedElementIds.length === 0) {
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
  if (canvas.selectedElementIds.length > 1) {
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
    value: string | number | boolean
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
        <Input
          id="content"
          value={element.content}
          onChange={(e) => handlePropertyChange("content", e.target.value)}
          className="text-xs"
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
  );

  const renderImageProperties = (element: ImageElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="alt">대체 텍스트</Label>
        <Input
          id="alt"
          value={element.alt}
          onChange={(e) => handlePropertyChange("alt", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="objectFit">이미지 맞춤</Label>
        <Select
          value={element.objectFit}
          onValueChange={(value) => handlePropertyChange("objectFit", value)}
        >
          <SelectTrigger>
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
    </div>
  );

  const renderButtonProperties = (element: ButtonElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">텍스트</Label>
        <Input
          id="text"
          value={element.text}
          onChange={(e) => handlePropertyChange("text", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="backgroundColor">배경색</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={element.backgroundColor}
            onChange={(e) =>
              handlePropertyChange("backgroundColor", e.target.value)
            }
          />
        </div>
        <div>
          <Label htmlFor="textColor">글자색</Label>
          <Input
            id="textColor"
            type="color"
            value={element.textColor}
            onChange={(e) => handlePropertyChange("textColor", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="borderRadius">모서리 둥글기</Label>
        <Input
          id="borderRadius"
          type="number"
          value={element.borderRadius}
          onChange={(e) =>
            handlePropertyChange("borderRadius", parseInt(e.target.value))
          }
        />
      </div>

      <div>
        <Label htmlFor="href">링크 (선택사항)</Label>
        <Input
          id="href"
          value={element.href || ""}
          onChange={(e) => handlePropertyChange("href", e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );

  const renderContainerProperties = (element: ContainerElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="backgroundColor">배경색</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={element.backgroundColor}
          onChange={(e) =>
            handlePropertyChange("backgroundColor", e.target.value)
          }
        />
      </div>

      <div>
        <Label htmlFor="borderRadius">모서리 둥글기</Label>
        <Input
          id="borderRadius"
          type="number"
          value={element.borderRadius}
          onChange={(e) =>
            handlePropertyChange("borderRadius", parseInt(e.target.value))
          }
        />
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

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        <div>
          <Label htmlFor="width" className="text-xs">
            너비
          </Label>
          <Input
            id="width"
            type="text"
            placeholder="auto 또는 숫자"
            value={element.width === "auto" ? "auto" : element.width.toString()}
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

  const renderAccordionProperties = (element: AccordionElement) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <Label className="text-xs">아코디언 설정</Label>
        <div className="space-y-2 mt-1 lg:mt-2">
          <div>
            <Label className="text-xs">변형</Label>
            <Select
              value={element.variant || "default"}
              onValueChange={(value) =>
                updateElement(element.id, {
                  variant: value as "default" | "outline" | "ghost",
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">기본</SelectItem>
                <SelectItem value="outline">아웃라인</SelectItem>
                <SelectItem value="ghost">고스트</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              접을 수 있음
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarProperties = (element: CalendarElement) => (
    <div className="space-y-2 lg:space-y-4">
      <div>
        <Label className="text-xs">캘린더 설정</Label>
        <div className="space-y-2 mt-1 lg:mt-2">
          <div>
            <Label className="text-xs">모드</Label>
            <Select
              value={element.mode || "single"}
              onValueChange={(value) =>
                updateElement(element.id, {
                  mode: value as "single" | "range" | "multiple",
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">단일 선택</SelectItem>
                <SelectItem value="range">범위 선택</SelectItem>
                <SelectItem value="multiple">다중 선택</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        {renderSpacingControls(selectedElement)}
        {renderCommonProperties(selectedElement)}
      </div>
    </Card>
  );
}
