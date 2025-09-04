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
import { Element } from "@/shared/types";
import { cn } from "@/lib/utils";
import { createElement, generateId } from "@/shared/lib/element-factory";

export default function PropertyPanel() {
  const { canvas, updateElement, deleteElement, addChildElement } =
    useEditorStore();

  // 다중 선택된 경우 속성 패널 비활성화
  if (canvas.selectedElementIds.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">속성</h3>
        <p className="text-sm text-gray-500">
          요소를 선택하여 속성을 편집하세요.
        </p>
      </Card>
    );
  }

  // 다중 선택된 경우 속성 패널 비활성화
  if (canvas.selectedElementIds.length > 1) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">속성</h3>
        <p className="text-sm text-gray-500">
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
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">속성</h3>
        <p className="text-sm text-gray-500">선택된 요소를 찾을 수 없습니다.</p>
      </Card>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
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
    value: number
  ) => {
    updateElement(selectedElement.id, {
      [property]: {
        ...selectedElement[property],
        [side]: value,
      },
    });
  };

  const renderSpacingControls = (element: Element) => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">패딩</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="padding-top">위</Label>
            <Input
              id="padding-top"
              type="number"
              value={element.padding.top}
              onChange={(e) =>
                handleSpacingChange(
                  "padding",
                  "top",
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="padding-right">오른쪽</Label>
            <Input
              id="padding-right"
              type="number"
              value={element.padding.right}
              onChange={(e) =>
                handleSpacingChange(
                  "padding",
                  "right",
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="padding-bottom">아래</Label>
            <Input
              id="padding-bottom"
              type="number"
              value={element.padding.bottom}
              onChange={(e) =>
                handleSpacingChange(
                  "padding",
                  "bottom",
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="padding-left">왼쪽</Label>
            <Input
              id="padding-left"
              type="number"
              value={element.padding.left}
              onChange={(e) =>
                handleSpacingChange(
                  "padding",
                  "left",
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextProperties = (element: any) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">내용</Label>
        <Input
          id="content"
          value={element.content}
          onChange={(e) => handlePropertyChange("content", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="fontSize">글자 크기</Label>
          <Input
            id="fontSize"
            type="number"
            value={element.fontSize}
            onChange={(e) =>
              handlePropertyChange("fontSize", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="color">색상</Label>
          <Input
            id="color"
            type="color"
            value={element.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="textAlign">정렬</Label>
        <Select
          value={element.textAlign}
          onValueChange={(value) => handlePropertyChange("textAlign", value)}
        >
          <SelectTrigger>
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
        <Label htmlFor="fontWeight">글자 굵기</Label>
        <Select
          value={element.fontWeight}
          onValueChange={(value) => handlePropertyChange("fontWeight", value)}
        >
          <SelectTrigger>
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

  const renderImageProperties = (element: any) => (
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

  const renderButtonProperties = (element: any) => (
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

  const handleAddChildElement = (elementType: "text" | "image" | "button") => {
    if (!selectedElement || selectedElement.type !== "container") return;

    const newElement = createElement(elementType, generateId(), 20, 20);
    addChildElement(selectedElement.id, newElement);
  };

  const renderContainerProperties = (element: any) => (
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

      <div>
        <Label>자식 요소 추가</Label>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleAddChildElement("text")}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            텍스트
          </button>
          <button
            onClick={() => handleAddChildElement("image")}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            이미지
          </button>
          <button
            onClick={() => handleAddChildElement("button")}
            className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            버튼
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommonProperties = (element: Element) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="x">X 위치</Label>
          <Input
            id="x"
            type="number"
            value={element.x}
            onChange={(e) =>
              handlePropertyChange("x", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="y">Y 위치</Label>
          <Input
            id="y"
            type="number"
            value={element.y}
            onChange={(e) =>
              handlePropertyChange("y", parseInt(e.target.value))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="width">너비</Label>
          <Input
            id="width"
            type="number"
            value={element.width}
            onChange={(e) =>
              handlePropertyChange("width", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="height">높이</Label>
          <Input
            id="height"
            type="number"
            value={element.height}
            onChange={(e) =>
              handlePropertyChange("height", parseInt(e.target.value))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zIndex">Z 순서</Label>
        <Input
          id="zIndex"
          type="number"
          value={element.zIndex}
          onChange={(e) =>
            handlePropertyChange("zIndex", parseInt(e.target.value))
          }
        />
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
      default:
        return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">속성</h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          삭제
        </button>
      </div>

      <div className="space-y-6">
        {renderSpecificProperties()}
        {renderSpacingControls(selectedElement)}
        {renderCommonProperties(selectedElement)}
      </div>
    </Card>
  );
}
