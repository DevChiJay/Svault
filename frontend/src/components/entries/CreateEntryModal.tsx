import { useState } from 'react'
import { Eye, EyeOff, Wand2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useCreateEntry } from '@/hooks/useEntries'
import { createEntrySchema, type CreateEntryFormData } from '@/schemas/entry.schema'
import PasswordStrengthIndicator from '@/components/shared/PasswordStrengthIndicator'
import PasswordGenerator from '@/components/shared/PasswordGenerator'

interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateEntryModal({ isOpen, onClose }: CreateEntryModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const createEntryMutation = useCreateEntry()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateEntryFormData>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      website_name: '',
      website_url: '',
      login_email_or_username: '',
      password: '',
      notes: '',
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: CreateEntryFormData) => {
    await createEntryMutation.mutateAsync(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    setShowPassword(false)
    setShowGenerator(false)
    onClose()
  }

  const handleUseGeneratedPassword = (password: string) => {
    setValue('password', password, { shouldValidate: true })
    setShowGenerator(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Password Entry</DialogTitle>
          <DialogDescription>
            Add a new password to your secure vault. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Website Name */}
          <div className="space-y-2">
            <Label htmlFor="website_name">
              Website Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="website_name"
              placeholder="e.g., Google, Facebook, GitHub"
              {...register('website_name')}
              className={errors.website_name ? 'border-red-500' : ''}
            />
            {errors.website_name && (
              <p className="text-sm text-red-500">{errors.website_name.message}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              {...register('website_url')}
              className={errors.website_url ? 'border-red-500' : ''}
            />
            {errors.website_url && (
              <p className="text-sm text-red-500">{errors.website_url.message}</p>
            )}
          </div>

          {/* Email/Username */}
          <div className="space-y-2">
            <Label htmlFor="login_email_or_username">
              Email or Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="login_email_or_username"
              placeholder="your.email@example.com or username"
              {...register('login_email_or_username')}
              className={errors.login_email_or_username ? 'border-red-500' : ''}
            />
            {errors.login_email_or_username && (
              <p className="text-sm text-red-500">{errors.login_email_or_username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a strong password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGenerator(!showGenerator)}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {passwordValue && <PasswordStrengthIndicator password={passwordValue} />}
          </div>

          {/* Password Generator */}
          {showGenerator && (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <PasswordGenerator onUsePassword={handleUseGeneratedPassword} />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this password..."
              rows={3}
              {...register('notes')}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEntryMutation.isPending}>
              {createEntryMutation.isPending ? 'Creating...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
