"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, FileIcon, EditIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  path: string;
  createdAt: string;
}

export default function WebsitePagesPage() {
  const router = useRouter();
  const params = useParams();
  const websiteId = params.id as string;

  const [pages, setPages] = useState<Page[]>([
    {
      id: "page1",
      title: "홈페이지",
      path: "/",
      createdAt: "2024-01-15"
    },
    {
      id: "page2",
      title: "소개",
      path: "/about",
      createdAt: "2024-01-16"
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPagePath, setNewPagePath] = useState("");

  const handleCreatePage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: newPageTitle,
      path: newPagePath.startsWith('/') ? newPagePath : `/${newPagePath}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPages([...pages, newPage]);
    setIsCreateDialogOpen(false);
    setNewPageTitle("");
    setNewPagePath("");
  };

  const handleEditPage = (pageId: string) => {
    router.push(`/editor/${pageId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/websites">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                웹사이트 목록
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">페이지 관리</h1>
              <p className="text-gray-600 mt-2">웹사이트의 페이지들을 관리하세요</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                새 페이지
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 페이지 만들기</DialogTitle>
                <DialogDescription>
                  새로운 페이지를 만들어보세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">페이지 제목</Label>
                  <Input
                    id="title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="예: 홈페이지"
                  />
                </div>
                <div>
                  <Label htmlFor="path">URL 경로</Label>
                  <Input
                    id="path"
                    value={newPagePath}
                    onChange={(e) => setNewPagePath(e.target.value)}
                    placeholder="예: /about"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreatePage}>
                  만들기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FileIcon className="w-8 h-8 text-green-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPage(page.id)}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{page.title}</CardTitle>
                <CardDescription>{page.path}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <p>생성일: {page.createdAt}</p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleEditPage(page.id)}
                >
                  편집하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <FileIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 페이지가 없습니다</h2>
            <p className="text-gray-600 mb-6">첫 번째 페이지를 만들어보세요!</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              새 페이지 만들기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}