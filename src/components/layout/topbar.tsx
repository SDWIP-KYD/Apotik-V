'use client'

import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'

export function Topbar() {
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <header
      className="flex h-16 items-center justify-between px-6 z-10"
      style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E63946]" />
          <h2 className="text-lg font-bold text-[#1D3557] tracking-tight">Dashboard</h2>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-white/80 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#1D3557] text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl" align="end" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(29,53,87,0.12)' }}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-[#1D3557] leading-none">
                  {session?.user?.name}
                </p>
                <p className="text-xs leading-none text-[#6B7280]">
                  {session?.user?.email}
                </p>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#E63946]">
                  {session?.user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/40" />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/40" />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
