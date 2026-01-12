import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail, KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import ResendVerificationAlert from '@/components/auth/ResendVerificationAlert'
import { useLogin, useIsAuthenticated } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'

export default function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)
  const [emailForVerification, setEmailForVerification] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const email = watch('email', '')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Check for verification error
  useEffect(() => {
    if (login.isError && login.error) {
      const errorMessage = (login.error as any)?.response?.data?.detail || ''
      if (errorMessage.toLowerCase().includes('verify')) {
        setShowVerificationAlert(true)
        setEmailForVerification(email)
      } else {
        setShowVerificationAlert(false)
      }
    }
  }, [login.isError, login.error, email])

  const onSubmit = (data: LoginFormData) => {
    setShowVerificationAlert(false)
    login.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Info Section */}
        <div className="hidden lg:block space-y-8 p-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">SecureVault</h1>
                <p className="text-sm text-gray-600">Your Digital Key Manager</p>
              </div>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed">
              Secure, simple, and powerful password management for modern life.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Bank-Level Encryption</h3>
                <p className="text-gray-600 text-sm">
                  Your passwords are encrypted with AES-256 encryption, the same standard used by banks and military.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Password Generator</h3>
                <p className="text-gray-600 text-sm">
                  Generate strong, unique passwords for every account with our built-in password generator.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Zero-Knowledge Architecture</h3>
                <p className="text-gray-600 text-sm">
                  We never have access to your master password or unencrypted data. Only you can decrypt your vault.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              "The best password is the one you don't have to remember." - Join thousands of users who trust SecureVault.
            </p>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex justify-center lg:hidden mb-2">
              <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center lg:text-left">Welcome Back</CardTitle>
            <CardDescription className="text-base text-center lg:text-left">
              Sign in to access your secure password vault
            </CardDescription>
          </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Verification Alert */}
            {showVerificationAlert && emailForVerification && (
              <ResendVerificationAlert email={emailForVerification} />
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                  disabled={login.isPending}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                  disabled={login.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}
