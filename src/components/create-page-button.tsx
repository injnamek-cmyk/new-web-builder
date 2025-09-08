'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export function CreatePageButton() {
  const router = useRouter()

  const handleCreateNewPage = () => {
    // 간단한 ID 생성. 프로덕션 환경에서는 CUID나 UUID 같이 더 견고한 방식을 추천합니다.
    const newPageId = `page_${Date.now()}` 
    router.push(`/editor/${newPageId}`)
  }

  return (
    <Button onClick={handleCreateNewPage} size="lg">
      <PlusCircle className="w-5 h-5 mr-2" />
      새 페이지 만들기
    </Button>
  )
}
