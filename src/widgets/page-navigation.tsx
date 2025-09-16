"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePageStore } from "@/processes/page-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MenuIcon, HomeIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PageNavigationProps {
  className?: string;
  variant?: "desktop" | "mobile";
}

export function PageNavigation({ className, variant = "desktop" }: PageNavigationProps) {
  const { pages, fetchPages } = usePageStore();
  const [publishedPages, setPublishedPages] = useState(pages.filter(page => page.isPublished));

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    setPublishedPages(pages.filter(page => page.isPublished));
  }, [pages]);

  if (variant === "mobile") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MenuIcon className="w-4 h-4" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/" className="flex items-center">
              <HomeIcon className="w-4 h-4 mr-2" />
              홈
            </Link>
          </DropdownMenuItem>
          {publishedPages.map((page) => (
            <DropdownMenuItem key={page.id} asChild>
              <Link href={page.path} className="flex items-center justify-between">
                <span>{page.title}</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "flex items-center")}>
              <HomeIcon className="w-4 h-4 mr-2" />
              홈
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {publishedPages.map((page) => (
          <NavigationMenuItem key={page.id}>
            <Link href={page.path} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {page.title}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface SiteHeaderProps {
  title?: string;
  showPageNavigation?: boolean;
}

export function SiteHeader({ title = "Web Builder", showPageNavigation = true }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{title}</span>
          </Link>
          {showPageNavigation && <PageNavigation />}
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="md:hidden">
              <span className="font-bold">{title}</span>
            </Link>
          </div>
          <nav className="flex items-center">
            {showPageNavigation && (
              <div className="md:hidden">
                <PageNavigation variant="mobile" />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}