'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Pill,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: ('DOCTOR' | 'STAFF')[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Medical Records',
    href: '/medical-records',
    icon: FileText,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: Shield,
    roles: ['DOCTOR'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const userRole = session?.user?.role as 'DOCTOR' | 'STAFF' | undefined
  const filteredNavItems = navItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  )

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">Apotik-V</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User Section */}
      <div className="p-2">
        {!isCollapsed && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sign out</span>}
        </Button>
      </div>
    </aside>
  )
}
