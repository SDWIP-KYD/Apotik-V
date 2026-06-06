'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Package,
  Pill,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
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
    label: 'Pasien',
    href: '/patients',
    icon: Users,
    roles: ['DOCTOR', 'STAFF'],
  },
  {
    label: 'Rekam Medis',
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
        'relative flex flex-col h-screen transition-all duration-300 overflow-hidden',
        isCollapsed ? 'w-[68px]' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(29,53,87,0.96) 0%, rgba(22,42,69,0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* Bauhaus Geometric Decorations */}
      <div className="absolute top-6 right-4 w-16 h-16 rounded-full opacity-[0.07] bg-[#E63946]" />
      <div className="absolute bottom-24 left-3 w-10 h-10 opacity-[0.05] bg-[#F4A261]" style={{ transform: 'rotate(45deg)' }} />
      <div className="absolute top-1/3 right-2 w-6 h-6 rounded-full opacity-[0.05] bg-[#2A9D8F]" />

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-5 z-10">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E63946] flex items-center justify-center shadow-[0_2px_8px_rgba(230,57,70,0.4)]">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">
              Apotik<span className="text-[#E63946]">-V</span>
            </h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#E63946] flex items-center justify-center shadow-[0_2px_8px_rgba(230,57,70,0.4)] mx-auto">
            <span className="text-white font-black text-sm">V</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 text-white/60 hover:text-white hover:bg-white/10"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-3 space-y-1 z-10">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white/12 text-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
                isCollapsed && 'justify-center px-2'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E63946] rounded-r-full" />
              )}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#E63946]" : "")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* User Section */}
      <div className="relative px-3 py-3 z-10">
        {!isCollapsed && (
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
            <p className="text-[0.7rem] font-semibold text-white/40 uppercase tracking-wider truncate">
              {session?.user?.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-white/50 hover:text-white hover:bg-white/10',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
        </Button>
      </div>
    </aside>
  )
}
