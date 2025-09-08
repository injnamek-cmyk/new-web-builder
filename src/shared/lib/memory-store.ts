// 메모리 기반 데이터 저장소 (향후 데이터베이스로 교체)

import { Canvas } from "@/shared/types";

export interface PageData {
  id: string;
  title: string;
  canvas: Canvas;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  private pages = new Map<string, PageData>();

  // 페이지 생성
  createPage(title: string, canvas: Canvas): PageData {
    const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const pageData: PageData = {
      id,
      title,
      canvas,
      createdAt: now,
      updatedAt: now,
    };

    this.pages.set(id, pageData);
    return pageData;
  }

  // 페이지 조회
  getPage(id: string): PageData | undefined {
    return this.pages.get(id);
  }

  // 모든 페이지 조회
  getAllPages(): PageData[] {
    return Array.from(this.pages.values());
  }

  // 페이지 업데이트
  updatePage(id: string, updates: Partial<Pick<PageData, 'title' | 'canvas'>>): PageData | null {
    const existingPage = this.pages.get(id);
    if (!existingPage) {
      return null;
    }

    const updatedPage: PageData = {
      ...existingPage,
      ...updates,
      updatedAt: new Date(),
    };

    this.pages.set(id, updatedPage);
    return updatedPage;
  }

  // 페이지 삭제
  deletePage(id: string): boolean {
    return this.pages.delete(id);
  }

  // 페이지 존재 여부 확인
  hasPage(id: string): boolean {
    return this.pages.has(id);
  }
}

// 싱글톤 인스턴스
let memoryStore: MemoryStore;

export function getMemoryStore(): MemoryStore {
  if (!memoryStore) {
    memoryStore = new MemoryStore();
  }
  return memoryStore;
}