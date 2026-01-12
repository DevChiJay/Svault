/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
// import { Badge } from '@/components/ui/badge'
import { Copy, Edit, Eye, Trash2, ExternalLink } from 'lucide-react'
import { useEntries, useSearchWebsite, useSearchEmail } from '@/hooks/useEntries'
import { formatDistanceToNow } from 'date-fns'
import { copyToClipboard } from '@/lib/clipboard'
import Pagination from '@/components/shared/Pagination'
import CreateEntryModal from '@/components/entries/CreateEntryModal'
import EditEntryModal from '@/components/entries/EditEntryModal'
import RevealPasswordModal from '@/components/entries/RevealPasswordModal'
import DeleteConfirmDialog from '@/components/entries/DeleteConfirmDialog'
import type { PasswordEntry } from '@/types'

export default function DashboardPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'website' | 'email'>('website')
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [revealModalOpen, setRevealModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null)

  // Determine which query to use based on search state
  const entriesQuery = useEntries(page, pageSize)
  const websiteSearchQuery = useSearchWebsite(searchQuery, page, pageSize)
  const emailSearchQuery = useSearchEmail(searchQuery, page, pageSize)

  // Select the active query based on search state
  const activeQuery = searchQuery
    ? searchType === 'website'
      ? websiteSearchQuery
      : emailSearchQuery
    : entriesQuery

  const handleSearch = (query: string, type: 'website' | 'email') => {
    setSearchQuery(query)
    setSearchType(type)
    setPage(1) // Reset to first page on new search
  }

  const handleNewPassword = () => {
    setCreateModalOpen(true)
  }

  const handleCopyUsername = (username: string) => {
    copyToClipboard(username, 'Username')
  }

  const handleReveal = (entryId: string) => {
    setSelectedEntryId(entryId)
    setRevealModalOpen(true)
  }

  const handleEdit = (entry: PasswordEntry) => {
    setSelectedEntry(entry)
    setSelectedEntryId(entry.entry_id)
    setEditModalOpen(true)
  }

  const handleDelete = (entry: PasswordEntry) => {
    setSelectedEntry(entry)
    setSelectedEntryId(entry.entry_id)
    setDeleteDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page when changing page size
  }

  // const getPasswordStrengthColor = (strength?: string) => {
  //   if (!strength) return 'bg-gray-100 text-gray-800'
  //   switch (strength.toLowerCase()) {
  //     case 'very strong':
  //       return 'bg-green-100 text-green-800'
  //     case 'strong':
  //       return 'bg-lime-100 text-lime-800'
  //     case 'medium':
  //       return 'bg-yellow-100 text-yellow-800'
  //     case 'weak':
  //       return 'bg-orange-100 text-orange-800'
  //     case 'very weak':
  //       return 'bg-red-100 text-red-800'
  //     default:
  //       return 'bg-gray-100 text-gray-800'
  //   }
  // }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Focus search (handled by SearchBar)
      // Ctrl/Cmd + N - New entry
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setCreateModalOpen(true)
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setCreateModalOpen(false)
        setEditModalOpen(false)
        setRevealModalOpen(false)
        setDeleteDialogOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DashboardLayout
      onNewPassword={handleNewPassword}
      onSearch={handleSearch}
      totalPasswords={activeQuery.data?.total || 0}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : `Manage your ${activeQuery.data?.total || 0} password entries`}
            </p>
          </div>
          {searchQuery && (
            <Button variant="outline" onClick={() => handleSearch('', 'website')} className="w-full sm:w-auto">
              Clear Search
            </Button>
          )}
        </div>

        {/* Password Entries Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeQuery.isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeQuery.isError ? (
            <div className="p-12 text-center">
              <p className="text-red-600">Failed to load password entries</p>
              <Button
                variant="outline"
                onClick={() => activeQuery.refetch()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : !activeQuery.data?.entries || activeQuery.data.entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery ? 'No results found' : 'No password entries yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try a different search query'
                  : 'Create your first password entry to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewPassword}>
                  Create First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Website</TableHead>
                        <TableHead className="min-w-[180px]">Username/Email</TableHead>
                        <TableHead className="min-w-[120px]">Last Modified</TableHead>
                        <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                {activeQuery.data.entries.map((entry) => (
                  <TableRow key={entry.entry_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{entry.website_name}</div>
                        {entry.website_url ? (
                          <a
                            href={entry.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-800 inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                              {entry.website_url}
                            </span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No URL</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{entry.login_email_or_username}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleCopyUsername(entry.login_email_or_username)
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {formatDistanceToNow(new Date(entry.updated_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReveal(entry.entry_id)}
                          title="Reveal password"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                          title="Edit entry"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry)}
                          title="Delete entry"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Pagination */}
        {activeQuery.data && activeQuery.data.total_pages > 1 && (
          <Pagination
            currentPage={activeQuery.data.page}
            totalPages={activeQuery.data.total_pages}
            pageSize={pageSize}
            totalItems={activeQuery.data.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Modals */}
      <CreateEntryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <EditEntryModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        entryId={selectedEntryId}
      />
      <RevealPasswordModal
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
        entryId={selectedEntryId}
      />
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        entryId={selectedEntryId}
        websiteName={selectedEntry?.website_name || null}
      />
    </DashboardLayout>
  )
}
