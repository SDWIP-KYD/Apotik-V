'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from '@/lib/validations'
import { updateProfile, changePassword, updateProfileImage, removeProfileImage } from '@/server/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string | null
    createdAt: Date
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { update: updateSession } = useSession()
  const router = useRouter()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(user.image ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  async function onProfileSubmit(data: ProfileInput) {
    setIsUpdatingProfile(true)
    try {
      const result = await updateProfile(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Profile updated')
      await updateSession()
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  async function onPasswordSubmit(data: ChangePasswordInput) {
    setIsChangingPassword(true)
    try {
      const result = await changePassword(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click()
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setIsUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        setPreviewImage(base64)
        const result = await updateProfileImage(base64)
        if (result.error) {
          toast.error(result.error)
          setPreviewImage(user.image ?? null)
          return
        }
        toast.success('Profile picture updated')
        await updateSession()
        router.refresh()
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (e) {
      toast.error('Failed to upload image')
      setIsUploadingImage(false)
    }
  }

  async function handleRemoveImage() {
    setIsUploadingImage(true)
    try {
      const result = await removeProfileImage()
      if (result.error) {
        toast.error(result.error)
        return
      }
      setPreviewImage(null)
      toast.success('Profile picture removed')
      await updateSession()
      router.refresh()
    } catch (e) {
      toast.error('Failed to remove image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Click the avatar to upload a new picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button
                type="button"
                onClick={handleImageClick}
                className="relative rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1D3557] focus:ring-offset-2"
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewImage ?? undefined} alt={user.name} />
                  <AvatarFallback className="bg-[#1D3557] text-white text-2xl font-black">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  {isUploadingImage ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280]">
                JPG, PNG or GIF. Max size 2MB.
              </p>
              {previewImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploadingImage}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...profileForm.register('name')} disabled={isUpdatingProfile} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...profileForm.register('email')} disabled={isUpdatingProfile} />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role} disabled className="bg-gray-50" />
              <p className="text-xs text-[#6B7280]">Contact an administrator to change your role</p>
            </div>
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Ensure your account stays secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} disabled={isChangingPassword} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} disabled={isChangingPassword} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} disabled={isChangingPassword} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
