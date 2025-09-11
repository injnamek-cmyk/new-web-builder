"use client";

import { useSession } from "next-auth/react";
import { usePages } from "@/hooks/use-pages";
import AuthButton from "@/components/auth-button";
import { CreatePageButton } from "@/components/create-page-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit, Loader2 } from "lucide-react";
import { DeletePageButton } from "@/components/delete-page-button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: pages = [], isLoading, error } = usePages();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">오류가 발생했습니다</h1>
          <p className="text-gray-600">페이지를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <header className="absolute top-6 right-6">
        <AuthButton />
      </header>
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {session?.user?.name
                ? `${session.user.name}님의 페이지`
                : "내 페이지"}
            </h1>
            <p className="text-md text-gray-600 mt-1">
              여기에서 페이지를 관리하고 새로 만드세요.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <CreatePageButton />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>페이지를 불러오는 중...</span>
            </div>
          </div>
        ) : pages.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pages.map((page) => (
              <Card
                key={page.id}
                className="flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="truncate">
                    {page.title || page.id}
                  </CardTitle>
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
                  <DeletePageButton 
                    pageId={page.id} 
                    pageTitle={page.title || page.id}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 border border-dashed border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              아직 생성된 페이지가 없습니다.
            </h2>
            <p className="text-gray-500 mb-6">
              첫 페이지를 만들어 당신의 아이디어를 실현하세요.
            </p>
            <CreatePageButton />
          </div>
        )}
      </main>
    </div>
  );
}
