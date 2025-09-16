import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { DynamicPageRenderer } from "@/widgets/dynamic-page-renderer";
import { Page, Element, PageMetadata } from "@/shared/types";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ subdomain: string; path: string[] }>;
}

async function getPageBySubdomainAndPath(subdomain: string, path: string): Promise<Page | null> {
  try {
    // 먼저 웹사이트를 찾습니다
    const website = await prisma.website.findUnique({
      where: {
        subdomain,
        isPublished: true,
      },
    });

    if (!website) return null;

    // 해당 웹사이트에서 페이지를 찾습니다
    const page = await prisma.page.findUnique({
      where: {
        websiteId_path: {
          websiteId: website.id,
          path,
        },
        isPublished: true,
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            domain: true,
          },
        },
      },
    });

    if (!page) return null;

    return {
      ...page,
      content: page.content as Element[],
      metadata: page.metadata as PageMetadata,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain, path } = await params;
  const fullPath = "/" + (path ? path.join("/") : "");

  const page = await getPageBySubdomainAndPath(subdomain, fullPath);

  if (!page) {
    return {
      title: "페이지를 찾을 수 없습니다",
      description: "요청하신 페이지가 존재하지 않습니다.",
    };
  }

  const metadata = page.metadata as PageMetadata;
  const websiteName = page.website?.name || "Website";

  return {
    title: metadata?.title || page.title,
    description: metadata?.description || "",
    keywords: metadata?.keywords || "",
    openGraph: {
      title: metadata?.ogTitle || metadata?.title || page.title,
      description: metadata?.ogDescription || metadata?.description || "",
      images: metadata?.ogImage ? [metadata.ogImage] : [],
      type: "website",
      siteName: websiteName,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata?.ogTitle || metadata?.title || page.title,
      description: metadata?.ogDescription || metadata?.description || "",
      images: metadata?.ogImage ? [metadata.ogImage] : [],
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { subdomain, path } = await params;
  const fullPath = "/" + (path ? path.join("/") : "");

  const page = await getPageBySubdomainAndPath(subdomain, fullPath);

  if (!page) {
    notFound();
  }

  return <DynamicPageRenderer page={page} />;
}