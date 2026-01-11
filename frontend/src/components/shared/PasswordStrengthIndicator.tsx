import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const metRequirements = requirements.filter((req) => req.test(password))
  const strength = metRequirements.length

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: '', color: 'gray' }
    if (strength <= 1) return { label: 'Very Weak', color: 'red' }
    if (strength === 2) return { label: 'Weak', color: 'orange' }
    if (strength === 3) return { label: 'Medium', color: 'yellow' }
    if (strength === 4) return { label: 'Strong', color: 'lime' }
    return { label: 'Very Strong', color: 'green' }
  }

  const { label, color } = getStrengthLabel()

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-500'
      case 'orange':
        return 'bg-orange-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'lime':
        return 'bg-lime-500'
      case 'green':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getTextColorClasses = () => {
    switch (color) {
      case 'red':
        return 'text-red-600'
      case 'orange':
        return 'text-orange-600'
      case 'yellow':
        return 'text-yellow-600'
      case 'lime':
        return 'text-lime-600'
      case 'green':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!password) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={cn('text-sm font-semibold', getTextColorClasses())}>{label}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                level <= strength ? getColorClasses() : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-700">Password Requirements:</span>
          <div className="space-y-1">
            {requirements.map((req, index) => {
              const met = req.test(password)
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {met ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span className={cn(met ? 'text-green-700' : 'text-gray-500')}>
                    {req.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
