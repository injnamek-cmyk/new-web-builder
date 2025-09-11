"use client";

import { useState } from "react";
import Image from "next/image";
import LeftNavigation from "@/components/navigation/left-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type DiagramType = "rectangle" | "polygon" | "ellipse";

const diagramConfig = {
  rectangle: {
    icon: "/icons/toolbar/rectangle.svg",
    label: "Rectangle"
  },
  polygon: {
    icon: "/icons/toolbar/polygon.svg",
    label: "Polygon"
  },
  ellipse: {
    icon: "/icons/toolbar/ellipse.svg",
    label: "Ellipse"
  }
};

export default function NewEditorPage() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>("rectangle");
  return (
    <main>
      {/* 헤더 */}
      <header className="px-5 py-[14px] bg-white border-b border-stone-300/50">
        <div className="flex">
          <Image src="/logo/ditto.svg" alt="Ditto" width={32} height={32} />
          <Image
            src="/logo/ditto_text.svg"
            alt="Ditto"
            width={64}
            height={32}
          />
        </div>
      </header>

      {/* 좌측 네비게이션/사이드 메뉴 */}
      <LeftNavigation />

      {/* 우측 편집/액션 패널 */}
      <aside className="w-72 h-[1020px] px-4 py-1 left-[1640px] top-[60px] absolute bg-white border-l border-stone-300/50 flex flex-col justify-start items-center gap-4">
        <nav className="flex flex-col justify-start items-center gap-2 w-full">
          <section className="w-full flex flex-col justify-center items-start gap-1">
            <div className="px-5 flex justify-between items-center w-full">
              <div className="flex gap-2">
                <span className="p-1 rounded-sm text-zinc-700/70 text-[10px] font-medium">
                  Menu
                </span>
                <span className="p-1 bg-zinc-500/20 rounded-sm text-neutral-900 text-[10px] font-semibold">
                  Studio
                </span>
              </div>
              <span className="h-4 py-3 flex flex-col justify-center items-center"></span>
            </div>
            <hr className="w-full   bg-zinc-300/50" />
          </section>
          <ul className="flex flex-col justify-start items-start gap-2 w-full">
            <li>
              <span className="text-neutral-900 text-xs font-semibold">
                Style
              </span>
              <ul className="flex flex-col justify-start items-start gap-0.5 w-full pl-2">
                <li className="py-1 text-zinc-700/40 text-xs">Text Styles</li>
                <li className="py-1 rounded-sm outline-[0.80px] outline-offset-[-0.80px] outline-teal-400 text-zinc-700/80 text-xs">
                  Sub 01
                </li>
              </ul>
            </li>
            <li className="text-neutral-900 text-xs font-semibold">Export</li>
          </ul>
        </nav>
      </aside>

      {/* 툴바/위젯/패널들 (적절한 section/aside 사용) */}
      <article className="px-3 py-2 rounded-lg flex justify-start items-center gap-2 shadow-md fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex justify-start items-center gap-2.5">
          <button className="bg-teal-300 rounded-lg shadow-md overflow-hidden p-2">
            <Image
              src="/icons/toolbar/cursor.svg"
              alt="Cursor"
              width={21}
              height={20}
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg overflow-hidden p-2 flex items-center gap-1">
                <Image
                  src={diagramConfig[selectedDiagram].icon}
                  alt={diagramConfig[selectedDiagram].label}
                  width={21}
                  height={20}
                />
                <ChevronDown size={12} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(diagramConfig).map(([key, config]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => setSelectedDiagram(key as DiagramType)}
                >
                  <Image
                    src={config.icon}
                    alt={config.label}
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="rounded-lg overflow-hidden p-2">
            <Image
              src="/icons/toolbar/text.svg"
              alt="Text"
              width={22}
              height={20}
            />
          </button>

          <button className="bg-white rounded-lg overflow-hidden p-2 flex items-center gap-2">
            <Image
              src="/icons/toolbar/line.svg"
              alt="Line"
              width={21}
              height={20}
            />
          </button>

          <button className="bg-white rounded-lg overflow-hidden p-2 flex items-center gap-2">
            <Image
              src="/icons/toolbar/button.svg"
              alt="Button"
              width={16}
              height={14}
            />
          </button>

          <button className="bg-white rounded-lg overflow-hidden p-2 flex items-center gap-2">
            <Image
              src="/icons/toolbar/icon.svg"
              alt="Icon"
              width={18}
              height={17}
            />
          </button>

          <button className="bg-white rounded-lg overflow-hidden p-2 flex items-center gap-2">
            <Image
              src="/icons/toolbar/input.svg"
              alt="Input"
              width={15}
              height={12}
            />
          </button>

          <button className="bg-white rounded-lg overflow-hidden p-2">
            <Image
              src="/icons/toolbar/image.svg"
              alt="Image"
              width={21}
              height={20}
            />
          </button>
        </div>

        <div className="flex justify-start items-center gap-2">
          <Image
            src="/icons/toolbar/widgets.svg"
            alt="Widgets"
            width={37}
            height={36}
          />
        </div>
      </article>
    </main>
  );
}
