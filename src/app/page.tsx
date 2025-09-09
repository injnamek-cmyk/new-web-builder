import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GET as getPages } from "@/app/api/pages/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Eye } from "lucide-react";
import AuthButton from "@/components/auth-button";
import { CreatePageButton } from "@/components/create-page-button";
import { Page } from "@prisma/client";

async function getPageData() {
  // HTTP 요청 대신 라우트 핸들러를 직접 호출합니다.
  const response = await getPages(new Request("http://localhost/api/pages"));
  const data = await response.json();
  return data.pages as Page[];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const pages = await getPageData();

  return (
    <div className="relative min-h-screen bg-gray-50">
      <header className="absolute top-6 right-6">
        <AuthButton />
      </header>
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {session?.user?.name ? `${session.user.name}님의 페이지` : "내 페이지"}
            </h1>
            <p className="text-md text-gray-600 mt-1">
              여기에서 페이지를 관리하고 새로 만드세요.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <CreatePageButton />
          </div>
        </div>

        {pages.length > 0 ? (
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