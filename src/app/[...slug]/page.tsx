import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { DynamicPageRenderer } from "@/widgets/dynamic-page-renderer";
import { Page, Element, PageMetadata } from "@/shared/types";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

async function getPageByPath(path: string): Promise<Page | null> {
  try {
    const page = await prisma.page.findUnique({
      where: {
        path,
        isPublished: true,
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
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const page = await getPageByPath(path);

  if (!page) {
    return {
      title: "페이지를 찾을 수 없습니다",
      description: "요청하신 페이지가 존재하지 않습니다.",
    };
  }

  const metadata = page.metadata as PageMetadata;

  return {
    title: metadata?.title || page.title,
    description: metadata?.description || "",
    keywords: metadata?.keywords || "",
    openGraph: {
      title: metadata?.ogTitle || metadata?.title || page.title,
      description: metadata?.ogDescription || metadata?.description || "",
      images: metadata?.ogImage ? [metadata.ogImage] : [],
      type: "website",
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
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const page = await getPageByPath(path);

  if (!page) {
    notFound();
  }

  return <DynamicPageRenderer page={page} />;
}