import { PrismaClient, Role } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  // Create DOCTOR user
  const doctorPassword = await hash('password123', 10)
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@apotikv.com' },
    update: {},
    create: {
      name: 'Dr. Andi Pratama',
      email: 'doctor@apotikv.com',
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  })
  console.log('Created doctor user:', doctor.email)

  // Create STAFF user
  const staffPassword = await hash('password123', 10)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@apotikv.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'staff@apotikv.com',
      password: staffPassword,
      role: Role.STAFF,
    },
  })
  console.log('Created staff user:', staff.email)

  console.log('Seeding completed!')

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
