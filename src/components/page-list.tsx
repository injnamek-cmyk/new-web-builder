"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Edit, Eye, Trash2 } from "lucide-react";
import { CreatePageButton } from "@/components/create-page-button";
import { Page } from "@prisma/client";
import { useRouter } from "next/navigation";

interface PageListProps {
  initialPages: Page[];
}

export function PageList({ initialPages }: PageListProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeletePage = async (pageId: string) => {
    setDeletingPageId(pageId);
    
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      // 성공적으로 삭제된 경우 로컬 상태에서 해당 페이지 제거
      setPages(prevPages => prevPages.filter(page => page.id !== pageId));
      
      // 페이지 새로고침하여 서버 상태와 동기화
      router.refresh();
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("페이지 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingPageId(null);
    }
  };

  if (pages.length === 0) {
    return (
      <div className="text-center bg-white p-12 border border-dashed border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          아직 생성된 페이지가 없습니다.
        </h2>
        <p className="text-gray-500 mb-6">
          첫 페이지를 만들어 당신의 아이디어를 실현하세요.
        </p>
        <CreatePageButton />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pages.map((page) => (
        <Card key={page.id} className="flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="truncate">{page.title || page.id}</CardTitle>
            <CardDescription>
              업데이트: {new Date(page.updatedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border">
              <p className="text-sm text-gray-400">미리보기 없음</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/preview/${page.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-1" />
                미리보기
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href={`/editor/${page.id}`}>
                <Edit className="w-4 h-4 mr-1" />
                수정
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={deletingPageId === page.id}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deletingPageId === page.id ? "삭제 중..." : "삭제"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>페이지를 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. &quot;{page.title || page.id}&quot; 페이지가 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeletePage(page.id)}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}