'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { useDeletePage } from '@/hooks/use-pages'
import { toast } from 'sonner'

interface DeletePageButtonProps {
  pageId: string
  pageTitle: string
  onDelete?: () => void
}

export function DeletePageButton({ pageId, pageTitle, onDelete }: DeletePageButtonProps) {
  const deletePageMutation = useDeletePage()

  const handleDelete = async () => {
    try {
      await deletePageMutation.mutateAsync(pageId)
      toast.success('페이지가 삭제되었습니다.')
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error(error)
      toast.error('페이지 삭제에 실패했습니다.')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={deletePageMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          {deletePageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>페이지 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{pageTitle}&rdquo; 페이지를 정말 삭제하시겠습니까?
            <br />
            <span className="text-red-600 font-medium">이 작업은 되돌릴 수 없습니다.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePageMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePageMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제하기'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}