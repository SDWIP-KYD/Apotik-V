'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from '@/lib/validations'
import { hash, compare } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) return { error: 'User not found' }
    return { data: user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to fetch profile' }
  }
}

export async function updateProfile(input: ProfileInput) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const validated = profileSchema.parse(input)

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (validated.email !== existingUser?.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validated.email },
        select: { id: true },
      })
      if (emailTaken) return { error: 'Email already in use' }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        email: validated.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })

    revalidatePath('/profile')
    return { data: user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to update profile' }
  }
}

export async function changePassword(input: ChangePasswordInput) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const validated = changePasswordSchema.parse(input)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) return { error: 'User not found' }

    const isCurrentValid = await compare(validated.currentPassword, user.password)
    if (!isCurrentValid) return { error: 'Current password is incorrect' }

    const hashedPassword = await hash(validated.newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to change password' }
  }
}

export async function updateProfileImage(imageBase64: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageBase64 },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })

    revalidatePath('/profile')
    return { data: user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to update profile image' }
  }
}

export async function removeProfileImage() {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })

    revalidatePath('/profile')
    return { data: user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to remove profile image' }
  }
}
