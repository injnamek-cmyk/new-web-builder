import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          URL을 다시 확인해주세요.
        </p>

        <div className="space-x-4">
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}