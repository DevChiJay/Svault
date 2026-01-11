import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteEntry } from '@/hooks/useEntries'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  entryId: string | null
  websiteName: string | null
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  entryId,
  websiteName,
}: DeleteConfirmDialogProps) {
  const deleteEntryMutation = useDeleteEntry()

  const handleDelete = async () => {
    if (!entryId) return
    await deleteEntryMutation.mutateAsync(entryId)
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Password Entry?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete the password entry for{' '}
              <span className="font-semibold text-gray-900">{websiteName}</span>?
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone. The password will be permanently deleted from your vault.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEntryMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteEntryMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteEntryMutation.isPending ? 'Deleting...' : 'Delete Entry'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
