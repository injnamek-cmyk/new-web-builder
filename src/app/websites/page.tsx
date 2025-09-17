"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, FolderIcon, ExternalLinkIcon } from "lucide-react";

interface Website {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  createdAt: string;
}

export default function WebsitesPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: "1",
      name: "내 포트폴리오",
      description: "개인 포트폴리오 웹사이트",
      subdomain: "myportfolio",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "회사 홈페이지",
      description: "스타트업 회사 소개 페이지",
      subdomain: "mycompany",
      createdAt: "2024-01-20"
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [newWebsiteDescription, setNewWebsiteDescription] = useState("");
  const [newWebsiteSubdomain, setNewWebsiteSubdomain] = useState("");

  const handleCreateWebsite = () => {
    const newWebsite: Website = {
      id: Date.now().toString(),
      name: newWebsiteName,
      description: newWebsiteDescription,
      subdomain: newWebsiteSubdomain,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWebsites([...websites, newWebsite]);
    setIsCreateDialogOpen(false);
    setNewWebsiteName("");
    setNewWebsiteDescription("");
    setNewWebsiteSubdomain("");
  };

  const handleWebsiteClick = (websiteId: string) => {
    router.push(`/websites/${websiteId}/pages`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 웹사이트</h1>
            <p className="text-gray-600 mt-2">웹사이트를 만들고 관리하세요</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                새 웹사이트
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 웹사이트 만들기</DialogTitle>
                <DialogDescription>
                  새로운 웹사이트를 만들어보세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">웹사이트 이름</Label>
                  <Input
                    id="name"
                    value={newWebsiteName}
                    onChange={(e) => setNewWebsiteName(e.target.value)}
                    placeholder="예: 내 포트폴리오"
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Input
                    id="description"
                    value={newWebsiteDescription}
                    onChange={(e) => setNewWebsiteDescription(e.target.value)}
                    placeholder="웹사이트에 대한 간단한 설명"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">서브도메인</Label>
                  <Input
                    id="subdomain"
                    value={newWebsiteSubdomain}
                    onChange={(e) => setNewWebsiteSubdomain(e.target.value)}
                    placeholder="예: myportfolio"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateWebsite}>
                  만들기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleWebsiteClick(website.id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FolderIcon className="w-8 h-8 text-blue-500" />
                  <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <CardTitle className="text-xl">{website.name}</CardTitle>
                <CardDescription>{website.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <p>서브도메인: {website.subdomain}.yourdomain.com</p>
                  <p>생성일: {website.createdAt}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {websites.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 웹사이트가 없습니다</h2>
            <p className="text-gray-600 mb-6">첫 번째 웹사이트를 만들어보세요!</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              새 웹사이트 만들기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}