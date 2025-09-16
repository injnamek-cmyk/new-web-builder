import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { DynamicPageRenderer } from "@/widgets/dynamic-page-renderer";
import { Page, Element, PageMetadata } from "@/shared/types";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

async function getWebsiteHomePage(subdomain: string): Promise<Page | null> {
  try {
    // 먼저 웹사이트를 찾습니다
    const website = await prisma.website.findUnique({
      where: {
        subdomain,
        isPublished: true,
      },
    });

    if (!website) return null;

    // 홈페이지는 "/" 경로를 가집니다
    const page = await prisma.page.findUnique({
      where: {
        websiteId_path: {
          websiteId: website.id,
          path: "/",
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

    if (!page) {
      // 홈페이지가 없으면 첫 번째 게시된 페이지를 찾습니다
      const firstPage = await prisma.page.findFirst({
        where: {
          websiteId: website.id,
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
        orderBy: {
          createdAt: "asc",
        },
      });

      if (!firstPage) return null;

      return {
        ...firstPage,
        content: firstPage.content as Element[],
        metadata: firstPage.metadata as PageMetadata,
        createdAt: firstPage.createdAt,
        updatedAt: firstPage.updatedAt,
      };
    }

    return {
      ...page,
      content: page.content as Element[],
      metadata: page.metadata as PageMetadata,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch website home page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;

  const page = await getWebsiteHomePage(subdomain);

  if (!page) {
    return {
      title: "웹사이트를 찾을 수 없습니다",
      description: "요청하신 웹사이트가 존재하지 않습니다.",
    };
  }

  const metadata = page.metadata as PageMetadata;
  const websiteName = page.website?.name || "Website";

  return {
    title: metadata?.title || page.title || websiteName,
    description: metadata?.description || "",
    keywords: metadata?.keywords || "",
    openGraph: {
      title: metadata?.ogTitle || metadata?.title || page.title || websiteName,
      description: metadata?.ogDescription || metadata?.description || "",
      images: metadata?.ogImage ? [metadata.ogImage] : [],
      type: "website",
      siteName: websiteName,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata?.ogTitle || metadata?.title || page.title || websiteName,
      description: metadata?.ogDescription || metadata?.description || "",
      images: metadata?.ogImage ? [metadata.ogImage] : [],
    },
  };
}

export default async function WebsiteHomePage({ params }: PageProps) {
  const { subdomain } = await params;

  const page = await getWebsiteHomePage(subdomain);

  if (!page) {
    notFound();
  }

  return <DynamicPageRenderer page={page} />;
}