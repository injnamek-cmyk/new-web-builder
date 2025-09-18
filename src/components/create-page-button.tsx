"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useCreatePage } from "@/hooks/use-pages";
import { toast } from "sonner";

export function CreatePageButton() {
  const { status } = useSession();
  const router = useRouter();
  const createPageMutation = useCreatePage();

  const handleCreatePage = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    try {
      const newPage = await createPageMutation.mutateAsync({
        title: "새 페이지",
        canvas: {
          elements: [],
          selectedElementIds: [],
          width: 1920,
          height: 1080,
        },
      });

      toast.success("새 페이지가 생성되었습니다.");
      router.push(`/editor/${newPage.id}`);
    } catch (error) {
      console.error(error);
      toast.error("페이지 생성에 실패했습니다.");
    }
  };

  if (status === "loading") {
    return (
      <Button disabled size="lg">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        확인 중...
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button onClick={() => router.push("/login")} size="lg">
        <PlusCircle className="w-5 h-5 mr-2" />새 페이지 만들려면 로그인
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCreatePage}
      disabled={createPageMutation.isPending}
      size="lg"
    >
      {createPageMutation.isPending ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <PlusCircle className="w-5 h-5 mr-2" />
      )}
      {createPageMutation.isPending ? "페이지 생성 중..." : "새 페이지 만들기"}
    </Button>
  );
}
