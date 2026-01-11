import { useState } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useGeneratePassword } from '@/hooks/useEntries'
import { copyToClipboard } from '@/lib/clipboard'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

interface PasswordGeneratorProps {
  onUsePassword?: (password: string) => void
}

export default function PasswordGenerator({ onUsePassword }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePasswordMutation = useGeneratePassword()

  const handleGenerate = async () => {
    const result = await generatePasswordMutation.mutateAsync({
      length,
      include_symbols: includeSymbols,
      include_numbers: includeNumbers,
      include_uppercase: includeUppercase,
      include_lowercase: includeLowercase,
    })
    setGeneratedPassword(result.password)
    setCopied(false)
  }

  const handleCopy = () => {
    if (generatedPassword) {
      copyToClipboard(generatedPassword, 'Password')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUse = () => {
    if (generatedPassword && onUsePassword) {
      onUsePassword(generatedPassword)
    }
  }

  return (
    <div className="space-y-6">
      {/* Length Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Password Length</Label>
          <span className="text-sm font-semibold text-primary-600">{length} characters</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={(val) => setLength(val[0])}
          min={8}
          max={128}
          step={1}
          className="w-full"
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label>Include:</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
            />
            <label
              htmlFor="symbols"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Symbols (!@#$%^&*)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
            />
            <label
              htmlFor="numbers"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Numbers (0-9)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
            />
            <label
              htmlFor="uppercase"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Uppercase Letters (A-Z)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
            />
            <label
              htmlFor="lowercase"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lowercase Letters (a-z)
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        className="w-full"
        disabled={generatePasswordMutation.isPending}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${generatePasswordMutation.isPending ? 'animate-spin' : ''}`} />
        Generate Password
      </Button>

      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Generated Password</Label>
            <div className="flex gap-2">
              <Input
                value={generatedPassword}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Password Strength */}
          <PasswordStrengthIndicator password={generatedPassword} showRequirements={false} />

          {/* Use Password Button */}
          {onUsePassword && (
            <Button onClick={handleUse} variant="default" className="w-full">
              Use This Password
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
