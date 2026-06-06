import { ProfileForm } from '@/components/features/profile/profile-form'
import { getProfile } from '@/server/actions/users'

export default async function ProfilePage() {
  const result = await getProfile()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B7280] font-medium">Error loading profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1D3557] flex items-center justify-center shadow-[0_4px_14px_rgba(29,53,87,0.3)]">
          <span className="text-white font-black text-lg">P</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1D3557] tracking-tight">My Profile</h1>
          <p className="text-sm text-[#6B7280] font-medium">Manage your account settings</p>
        </div>
      </div>

      <ProfileForm user={result.data} />
    </div>
  )
}
