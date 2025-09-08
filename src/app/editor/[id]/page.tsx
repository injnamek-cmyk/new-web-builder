import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Layout from "@/widgets/layout";
import { StoredPageData } from "@/shared/types/server-driven-ui";
import { Page } from "@prisma/client";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  let page: Page | null = null;

  try {
    page = await prisma.page.findUnique({
      where: {
        id: params.id,
      },
    });
  } catch (error) {
    console.error("Failed to fetch page:", error);
    // Handle DB connection errors or other unexpected errors
    redirect("/");
  }

  if (!page) {
    redirect("/");
  }

  // The 'content' field from Prisma with type 'Json' is already a JS object.
  const pageData = page.content as unknown as StoredPageData;

  return <Layout initialPageData={pageData} pageId={params.id} />;
}
