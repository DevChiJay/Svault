import { useState, useEffect } from 'react'
import { Eye, Copy, Clock, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useRevealPassword } from '@/hooks/useEntries'
import { copyToClipboard } from '@/lib/clipboard'
import { formatDistanceToNow } from 'date-fns'

interface RevealPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  entryId: string | null
}

const AUTO_HIDE_DURATION = 30 // seconds

export default function RevealPasswordModal({ isOpen, onClose, entryId }: RevealPasswordModalProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_HIDE_DURATION)
  const [extended, setExtended] = useState(false)
  const revealPasswordMutation = useRevealPassword()

  const revealedData = revealPasswordMutation.data

  // Fetch password when modal opens
  useEffect(() => {
    if (isOpen && entryId) {
      revealPasswordMutation.mutate(entryId)
    }
    // Reset state when modal opens
    if (isOpen) {
      setPasswordVisible(false)
      setCountdown(AUTO_HIDE_DURATION)
      setExtended(false)
    }
  }, [isOpen, entryId])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !passwordVisible || extended) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPasswordVisible(false)
          return AUTO_HIDE_DURATION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, passwordVisible, extended])

  const handleCopyPassword = () => {
    if (revealedData?.password) {
      copyToClipboard(revealedData.password, 'Password')
    }
  }

  const handleCopyUsername = () => {
    if (revealedData?.login_email_or_username) {
      copyToClipboard(revealedData.login_email_or_username, 'Username')
    }
  }

  const handleExtend = () => {
    setExtended(true)
    setCountdown(AUTO_HIDE_DURATION)
  }

  const handleClose = () => {
    setPasswordVisible(false)
    setCountdown(AUTO_HIDE_DURATION)
    setExtended(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader className="bg-gradient-to-r from-primary-50 to-accent-50 -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b">
          <DialogTitle className="text-primary-900">
            {revealedData?.website_name || 'Password Details'}
          </DialogTitle>
          <DialogDescription className="text-primary-700">
            View and copy your password securely. This window will auto-hide for security.
          </DialogDescription>
        </DialogHeader>

        {revealPasswordMutation.isPending ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Decrypting password...</p>
          </div>
        ) : revealedData ? (
          <div className="space-y-4">
            {/* Security Warning */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                Make sure no one is watching your screen. Password will auto-hide in {countdown} seconds.
              </AlertDescription>
            </Alert>

            {/* Website URL */}
            {revealedData.website_url && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Website URL</label>
                <p className="text-sm text-gray-900 break-all">{revealedData.website_url}</p>
              </div>
            )}

            {/* Username/Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Username / Email</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm font-medium text-blue-900 break-all">
                  {revealedData.login_email_or_username}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyUsername} className="border-blue-300 hover:bg-blue-50">
                  <Copy className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">Password</label>
                {passwordVisible && !extended && (
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Clock className="h-3 w-3" />
                    Auto-hiding in {countdown}s
                  </div>
                )}
              </div>
              
              {passwordVisible ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md px-3 py-3 text-lg font-mono text-white break-all shadow-lg">
                      {revealedData.password}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopyPassword} className="border-purple-300 hover:bg-purple-50">
                      <Copy className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                  {!extended && (
                    <Button variant="outline" size="sm" onClick={handleExtend} className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      Keep Password Visible
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setPasswordVisible(true)
                    setCountdown(AUTO_HIDE_DURATION)
                  }}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-md"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Click to Reveal Password
                </Button>
              )}
            </div>

            {/* Revealed At */}
            <div className="text-xs text-gray-500 text-center pt-2">
              Revealed {formatDistanceToNow(new Date(revealedData.revealed_at), { addSuffix: true })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-red-600">
            Failed to load password details
          </div>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
