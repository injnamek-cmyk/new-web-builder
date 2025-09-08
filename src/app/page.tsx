'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import AuthButton from '@/components/auth-button'

export default function LandingPage() {
  const router = useRouter()

  const handleCreateNewPage = () => {
    const newPageId = `page-${Date.now()}`
    router.push(`/editor/${newPageId}`)
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="absolute top-6 right-6">
        <AuthButton />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">웹 페이지 빌더</h1>
          <p className="text-lg text-gray-600 mb-8">새로운 페이지를 만들어 당신의 아이디어를 실현하세요.</p>
          
          <div className="bg-white p-8 border border-dashed border-gray-300 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">시작하기</h2>
              <p className="text-gray-500 mb-6">아직 생성된 페이지가 없습니다. 지금 바로 만들어보세요.</p>
              <Button onClick={handleCreateNewPage} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  새 페이지 만들기
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
