import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  onNewPassword?: () => void
  onSearch?: (query: string, searchType: 'website' | 'email') => void
  totalPasswords?: number
}

export default function DashboardLayout({ 
  children, 
  onNewPassword, 
  onSearch,
  totalPasswords 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        totalPasswords={totalPasswords}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 lg:ml-64`}
      >
        {/* Navbar */}
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          onNewPassword={onNewPassword}
          onSearch={onSearch}
        />

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
