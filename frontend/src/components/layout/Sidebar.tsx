import { Key, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useLogout } from '@/hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  totalPasswords?: number
}

export default function Sidebar({ isOpen, onToggle, totalPasswords = 0 }: SidebarProps) {
  const logout = useLogout()

  const handleLogout = () => {
    logout()
  }
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 sm:w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 rounded-lg p-2">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PassGuard</h1>
                <p className="text-xs text-gray-500">Password Manager</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4">
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                <span>All Passwords</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {totalPasswords}
                </Badge>
              </button>

              <Separator className="my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          <Separator />

          {/* Footer */}
          <div className="p-3 sm:p-4">
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Security Score
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-xs font-medium text-gray-700">75%</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {totalPasswords > 0 ? 'Good! Keep improving.' : 'Add passwords to get started.'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
