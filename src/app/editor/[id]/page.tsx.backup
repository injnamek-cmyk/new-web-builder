import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Layout from "@/widgets/layout";
import { StoredPageData } from "@/shared/types/server-driven-ui";
import { Page } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // The middleware should handle this, but as a fallback
    redirect(`/login?callbackUrl=/editor/${params.id}`);
  }

  let page: Page | null = null;

  try {
    // 소유권 확인을 위해 userId도 조건에 추가합니다.
    page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Failed to fetch page:", error);
    // Handle DB connection errors or other unexpected errors
    redirect("/");
  }

  if (!page) {
    // 페이지가 존재하지 않거나 사용자가 소유자가 아닌 경우
    redirect("/");
  }

  // The 'content' field from Prisma with type 'Json' is already a JS object.
  const pageData = page.content as unknown as StoredPageData;

  return <Layout initialPageData={pageData} pageId={params.id} />;
}