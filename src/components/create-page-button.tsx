'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'

export function CreatePageButton() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePage = async () => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: '새 페이지',
          canvas: {
            elements: [],
            selectedElementIds: [],
            width: 1920,
            height: 1080,
          }
        }),
      })

      if (!response.ok) {
        throw new Error('페이지 생성에 실패했습니다.')
      }

      const data = await response.json()
      router.push(`/editor/${data.page.id}`)
    } catch (error) {
      console.error(error)
      // 사용자에게 에러 알림을 표시하는 로직을 추가할 수 있습니다.
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Button disabled size="lg">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        확인 중...
      </Button>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Button onClick={() => router.push('/login')} size="lg">
        <PlusCircle className="w-5 h-5 mr-2" />
        새 페이지 만들려면 로그인
      </Button>
    )
  }

  return (
    <Button onClick={handleCreatePage} disabled={isLoading} size="lg">
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <PlusCircle className="w-5 h-5 mr-2" />
      )}
      {isLoading ? '페이지 생성 중...' : '새 페이지 만들기'}
    </Button>
  )
}
