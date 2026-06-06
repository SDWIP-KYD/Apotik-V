import { PrismaClient, Role, PrescriptionStatus } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)
  return d
}

function futureDate(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  if (/tablet/i.test(lower)) return 'Tablet'
  if (/kapsul/i.test(lower)) return 'Kapsul'
  if (/sirup|syrup/i.test(lower)) return 'Sirup'
  if (/drop|tetes/i.test(lower)) return 'Drop'
  if (/cream|krim|gel|salep/i.test(lower)) return 'Topikal'
  if (/suspensi/i.test(lower)) return 'Suspensi'
  if (/injeksi|inj|vial|ampul/i.test(lower)) return 'Injectable'
  return 'Lainnya'
}

function getUnit(category: string): string {
  switch (category) {
    case 'Tablet': return 'Tablet'
    case 'Kapsul': return 'Kapsul'
    case 'Sirup': return 'Botol'
    case 'Drop': return 'Botol'
    case 'Topikal': return 'Tube'
    case 'Suspensi': return 'Botol'
    case 'Injectable': return 'Ampul'
    default: return 'PCS'
  }
}

function loadMedicines(): { name: string; composition: string; price: number }[] {
  const jsonPath = join(__dirname, '..', 'goapotik_apotek-karunia-sehat-makassar_20260510_115132.json')
  const raw = readFileSync(jsonPath, 'utf-8')
  const products: any[] = JSON.parse(raw)

  const seen = new Set<string>()
  const unique: { name: string; composition: string; price: number }[] = []

  for (const p of products) {
    const productName = (p.product_name || '').trim()
    if (!productName || seen.has(productName.toLowerCase())) continue
    seen.add(productName.toLowerCase())

    const price = typeof p.effective_price === 'number' ? p.effective_price : 0
    unique.push({
      name: productName,
      composition: p.composition || '',
      price,
    })
  }

  return unique
}

async function main() {
  console.log('Seeding database with dummy data...')

  // === USERS ===
  const doctorPassword = await hash('k95', 10)
  const doctor = await prisma.user.upsert({
    where: { email: 'sovia@apotikv.com' },
    update: {},
    create: {
      name: 'Dr. Sovia Pratiwi Lahida',
      email: 'sovia@apotikv.com',
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  })

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
  console.log('Created users')

  // === PATIENTS ===
  const patientsData = [
    { medicalRecordNumber: '000001', name: 'Siti Rahmawati', suku: 'Sunda', dateOfBirth: new Date('1990-03-15'), gender: 'Female', phone: '081234567890', address: 'Jl. Merdeka No. 12, Bandung', allergies: 'Penicillin', emergencyContactName: 'Rahmat', emergencyContactPhone: '081234567891', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000002', name: 'Ahmad Fauzi', suku: 'Jawa', dateOfBirth: new Date('1985-07-22'), gender: 'Male', phone: '081234567891', address: 'Jl. Asia Afrika No. 45, Bandung', allergies: null, emergencyContactName: 'Fauziah', emergencyContactPhone: '081234567892', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000003', name: 'Dewi Lestari', suku: 'Bugis', dateOfBirth: new Date('1992-11-08'), gender: 'Female', phone: '081234567892', address: 'Jl. Dago No. 78, Bandung', allergies: 'Sulfonamide', emergencyContactName: 'Budi', emergencyContactPhone: '081234567893', emergencyContactRelation: 'Ayah' },
    { medicalRecordNumber: '000004', name: 'Rizky Pratama', suku: 'Madura', dateOfBirth: new Date('1988-01-30'), gender: 'Male', phone: '081234567893', address: 'Jl. Buah Batu No. 23, Bandung', allergies: null, emergencyContactName: 'Rizky Sr', emergencyContactPhone: '081234567894', emergencyContactRelation: 'Ayah' },
    { medicalRecordNumber: '000005', name: 'Putri Amelia', suku: 'Batak', dateOfBirth: new Date('1995-05-17'), gender: 'Female', phone: '081234567894', address: 'Jl. Ciamis No. 56, Bandung', allergies: 'Ibuprofen', emergencyContactName: 'Hendra', emergencyContactPhone: '081234567895', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000006', name: 'Hendra Wijaya', suku: 'Minang', dateOfBirth: new Date('1978-09-12'), gender: 'Male', phone: '081234567895', address: 'Jl. Setiabudhi No. 89, Bandung', allergies: null, emergencyContactName: 'Hendra Wife', emergencyContactPhone: '081234567896', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000007', name: 'Maya Sari', suku: 'Bali', dateOfBirth: new Date('1993-12-25'), gender: 'Female', phone: '081234567896', address: 'Jl. Riau No. 34, Bandung', allergies: 'Codeine', emergencyContactName: 'Komang', emergencyContactPhone: '081234567897', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000008', name: 'Dodi Saputra', suku: 'Makassar', dateOfBirth: new Date('1982-04-05'), gender: 'Male', phone: '081234567897', address: 'Jl. Gatot Subroto No. 67, Bandung', allergies: null, emergencyContactName: 'Dodi Wife', emergencyContactPhone: '081234567898', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000009', name: 'Rina Marlina', suku: 'Sunda', dateOfBirth: new Date('1991-08-19'), gender: 'Female', phone: '081234567898', address: 'Jl.Veteran No. 90, Bandung', allergies: 'Aspirin', emergencyContactName: 'Rina Husband', emergencyContactPhone: '081234567899', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000010', name: 'Firmansyah', suku: 'Jawa', dateOfBirth: new Date('1987-06-14'), gender: 'Male', phone: '081234567899', address: 'Jl. Pahlawan No. 11, Bandung', allergies: null, emergencyContactName: 'Firman Wife', emergencyContactPhone: '081234567800', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000011', name: 'Anisa Permata', suku: 'Bugis', dateOfBirth: new Date('1996-02-28'), gender: 'Female', phone: '081234567800', address: 'Jl. Sumatera No. 22, Bandung', allergies: null, emergencyContactName: 'Anisa Father', emergencyContactPhone: '081234567801', emergencyContactRelation: 'Ayah' },
    { medicalRecordNumber: '000012', name: 'Bambang Irawan', suku: 'Batak', dateOfBirth: new Date('1975-10-03'), gender: 'Male', phone: '081234567801', address: 'Jl. Aceh No. 33, Bandung', allergies: 'Metformin', emergencyContactName: 'Bambang Wife', emergencyContactPhone: '081234567802', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000013', name: 'Citra Dewi', suku: 'Minang', dateOfBirth: new Date('1994-07-21'), gender: 'Female', phone: '081234567802', address: 'Jl. Jendral Sudirman No. 44, Bandung', allergies: null, emergencyContactName: 'Citra Husband', emergencyContactPhone: '081234567803', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000014', name: 'Eko Prasetyo', suku: 'Madura', dateOfBirth: new Date('1980-12-11'), gender: 'Male', phone: '081234567803', address: 'Jl. Diponegoro No. 55, Bandung', allergies: null, emergencyContactName: 'Eko Wife', emergencyContactPhone: '081234567804', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000015', name: 'Fitri Handayani', suku: 'Bali', dateOfBirth: new Date('1997-09-09'), gender: 'Female', phone: '081234567804', address: 'Jl. Tamalanrea No. 66, Bandung', allergies: 'Amoxicillin', emergencyContactName: 'Fitri Father', emergencyContactPhone: '081234567805', emergencyContactRelation: 'Ayah' },
    { medicalRecordNumber: '000016', name: 'Gunawan Setiawan', suku: 'Makassar', dateOfBirth: new Date('1983-03-18'), gender: 'Male', phone: '081234567805', address: 'Jl. Antapani No. 77, Bandung', allergies: null, emergencyContactName: 'Gunawan Wife', emergencyContactPhone: '081234567806', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000017', name: 'Hana Permadi', suku: 'Sunda', dateOfBirth: new Date('1998-11-30'), gender: 'Female', phone: '081234567806', address: 'Jl. Cicendo No. 88, Bandung', allergies: null, emergencyContactName: 'Hana Mother', emergencyContactPhone: '081234567807', emergencyContactRelation: 'Ibu' },
    { medicalRecordNumber: '000018', name: 'Indra Lesmana', suku: 'Jawa', dateOfBirth: new Date('1979-05-25'), gender: 'Male', phone: '081234567807', address: 'Jl. Babakan Ciamis No. 99, Bandung', allergies: 'Paracetamol', emergencyContactName: 'Indra Wife', emergencyContactPhone: '081234567808', emergencyContactRelation: 'Istri' },
    { medicalRecordNumber: '000019', name: 'Julia Rohani', suku: 'Bugis', dateOfBirth: new Date('1990-01-07'), gender: 'Female', phone: '081234567808', address: 'Jl. Kopo No. 101, Bandung', allergies: null, emergencyContactName: 'Julia Husband', emergencyContactPhone: '081234567809', emergencyContactRelation: 'Suami' },
    { medicalRecordNumber: '000020', name: 'Kurniawan Adi', suku: 'Batak', dateOfBirth: new Date('1986-08-16'), gender: 'Male', phone: '081234567809', address: 'Jl. Soekarno-Hatta No. 112, Bandung', allergies: null, emergencyContactName: 'Kurniawan Wife', emergencyContactPhone: '081234567810', emergencyContactRelation: 'Istri' },
  ]

  const patients = []
  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: { ...p, createdById: doctor.id },
    })
    patients.push(patient)
  }
  console.log(`Created ${patients.length} patients`)

  // === MEDICINES FROM JSON ===
  const products = loadMedicines()

  const medicinesData = products
    .filter((p) => {
      if (p.price === 0 || p.price > 10000000) {
        p.price = 5000 + Math.floor(Math.random() * 45001)
      }
      return true
    })
    .map((p, idx) => {
      const category = getCategory(p.name)
      return {
        name: p.name,
        category,
        unit: getUnit(category),
        stockQty: 100 + Math.floor(Math.random() * 201),
        minThreshold: 10,
        expiryDate: futureDate(180 + Math.floor(Math.random() * 551)),
        price: p.price,
      }
    })

  const batchSize = 500
  let totalInserted = 0
  for (let i = 0; i < medicinesData.length; i += batchSize) {
    const chunk = medicinesData.slice(i, i + batchSize)
    const result = await prisma.medicine.createMany({
      data: chunk,
      skipDuplicates: true,
    })
    totalInserted += result.count
  }
  console.log(`Created ${totalInserted} medicines`)

  // Fetch all medicines for prescription references
  const allMedicines = await prisma.medicine.findMany()

  // === MEDICAL RECORDS, PRESCRIPTIONS & ITEMS ===
  const soapTemplates = [
    { subjective: 'Pasien mengeluh sakit kepala sejak 3 hari lalu, nyeri berdenyut di area pelipis', objective: 'Pemeriksaan fisik: kesadaran compos mentis, faring tidak merah', assessment: 'Tension type headache', plan: 'Ibuprofen 400mg 3x sehari 5 hari, istirahat cukup, hindari stres', bpSystolic: 130, bpDiastolic: 85, temperature: 36.8, respiratoryRate: 18, heartRate: 78, spo2: 98, weight: 65, height: 160, diagnosisCode: 'G43.9' },
    { subjective: 'Pasien batuk berdahak sejak seminggu lalu, demam ringan', objective: 'Faring congested, tonsil tidak membesar, paru bersih', assessment: 'Infeksi saluran pernapasan atas', plan: 'Amoxicillin 500mg 3x sehari 7 hari, Ambroxol 30mg 3x sehari, banyak minum air putih', bpSystolic: 120, bpDiastolic: 78, temperature: 37.5, respiratoryRate: 22, heartRate: 85, spo2: 97, weight: 58, height: 155, diagnosisCode: 'J06.9' },
    { subjective: 'Pasien mengeluh nyeri perut bagian atas, mual setelah makan', objective: 'Abdomen: nyeri tekan epigastrium, tidak ada defense muskuler', assessment: 'Dyspepsia', plan: 'Omeprazole 20mg 1x sehari pagi sebelum makan 2 minggu, hindari makanan pedas dan asam', bpSystolic: 118, bpDiastolic: 76, temperature: 36.5, respiratoryRate: 16, heartRate: 72, spo2: 99, weight: 70, height: 165, diagnosisCode: 'K29.7' },
    { subjective: 'Pasien datang dengan ruam kulit di lengan dan badan, gatal', objective: 'Kulit: eksantem makulopapular di ekstremitas atas dan trunka', assessment: 'Dermatitis alergi', plan: 'Cetirizine 10mg 1x sehari, Betamethasone cream 2x sehari pada area ruam, hindari allergen', bpSystolic: 122, bpDiastolic: 80, temperature: 36.6, respiratoryRate: 17, heartRate: 76, spo2: 99, weight: 55, height: 158, diagnosisCode: 'L25.9' },
    { subjective: 'Pasien demam tinggi sejak 2 hari, sakit tenggorokan, sulit menelan', objective: 'Oropharynx erythematous, tonsil T2, servikal tidak membesar', assessment: 'Faringitis akut', plan: 'Paracetamol 500mg 4x sehari, Azithromycin 500mg 1x sehari 3 hari, berkumur air garam', bpSystolic: 115, bpDiastolic: 75, temperature: 39.1, respiratoryRate: 20, heartRate: 92, spo2: 97, weight: 62, height: 162, diagnosisCode: 'J02.9' },
    { subjective: 'Pasien mengeluh nyeri sendi lutut kanan, bengkak ringan sejak seminggu', objective: 'Lutut kanan: bengkak ringan, ROM terbatas, tidak ada kemerahan', assessment: 'Osteoarthritis grade 2', plan: 'Diclofenac 50mg 2x sehari 7 hari, fisioterapi, kompres hangat', bpSystolic: 128, bpDiastolic: 82, temperature: 36.4, respiratoryRate: 16, heartRate: 74, spo2: 98, weight: 75, height: 168, diagnosisCode: 'M17.1' },
    { subjective: 'Pasien pilek terus-menerus 5 hari, hidung tersumbat, bersin-bersin', objective: 'Hidung: mukosa nasal edematous, servikal negatif', assessment: 'Rhinitis alergi', plan: 'Loratadine 10mg 1x sehari 2 minggu, Pseudoephedrine 30mg 2x sehari 5 hari', bpSystolic: 120, bpDiastolic: 78, temperature: 36.7, respiratoryRate: 18, heartRate: 76, spo2: 99, weight: 52, height: 155, diagnosisCode: 'J30.1' },
    { subjective: 'Pasien mual dan muntah sejak semalam, diare 3x', objective: 'Dehidrasi ringan, abdomen lembut, tidak ada nyeri tekan', assessment: 'Gastroenteritis akut', plan: 'Loperamide 2mg setelah diare (maks 8mg/hari), Ondansetron jika muntah, ORS, banyak cairan', bpSystolic: 110, bpDiastolic: 70, temperature: 37.0, respiratoryRate: 18, heartRate: 88, spo2: 98, weight: 68, height: 170, diagnosisCode: 'A09' },
    { subjective: 'Pasien datang untuk kontrol tekanan darah', objective: 'Kesadaran baik, tidak ada edema, fundoskopi: normal', assessment: 'Hipertensi stage 1 - belum terkontrol', plan: 'Amlodipine 5mg 1x sehari dilanjutkan, Diet rendah garam, olahraga rutin, kontrol 2 minggu lagi', bpSystolic: 145, bpDiastolic: 92, temperature: 36.7, respiratoryRate: 18, heartRate: 80, spo2: 98, weight: 82, height: 172, diagnosisCode: 'I10' },
    { subjective: 'Pasien mengeluh sesak napas ringan saat aktivitas, detak jantung cepat', objective: 'Kesadaran baik, tidak ada sianosis, tidak ada edema', assessment: 'Palpitasi, kemungkinan gangguan ritme ringan', plan: 'Metoprolol 50mg 2x sehari, EKG, kontrol 1 minggu', bpSystolic: 135, bpDiastolic: 88, temperature: 36.5, respiratoryRate: 24, heartRate: 92, spo2: 96, weight: 70, height: 165, diagnosisCode: 'R00.1' },
    { subjective: 'Pasien datang dengan luka gores di tangan kiri akibat terjatuh', objective: 'Luka gores superficial 5cm di dorsum tangan kiri, tidak dalam, tidak aktif berdarah', assessment: 'Luka gores superficial', plan: 'Pembersihan luka, Betamethasone cream jika iritasi, tutup luka, kontrol jika tanda infeksi', bpSystolic: 125, bpDiastolic: 80, temperature: 36.5, respiratoryRate: 16, heartRate: 78, spo2: 99, weight: 60, height: 160, diagnosisCode: 'S51.0' },
    { subjective: 'Pasien gatal-gatal di seluruh badan sejak 2 hari, ada bintik merah', objective: 'Urtikaria makula papular di seluruh trunka dan ekstremitas', assessment: 'Urtikaria', plan: 'Cetirizine 10mg 1x sehari 7 hari, Chlorpheniramine 4mg malam hari, hindari pemicu', bpSystolic: 118, bpDiastolic: 76, temperature: 36.6, respiratoryRate: 17, heartRate: 80, spo2: 99, weight: 55, height: 157, diagnosisCode: 'L50.0' },
    { subjective: 'Pasien mengeluh nyeri perut bagian bawah kanan, demam ringan', objective: 'Abdomen: nyeri tekan RIF, rebound negatif, blooming positif', assessment: 'Kemungkinan apendisitis, rujuk USG', plan: 'Paracetamol 500mg 3x sehari, observasi, rujuk ke RS jika memburuk', bpSystolic: 125, bpDiastolic: 80, temperature: 37.8, respiratoryRate: 20, heartRate: 88, spo2: 98, weight: 65, height: 163, diagnosisCode: 'K35.8' },
    { subjective: 'Pasien batuk kering sejak 4 hari, tidak ada dahak, nyeri dada ringan saat batuk', objective: 'Paru: tidak ada ronki, tidak ada wheezing, tidak ada bunyi napas tambahan', assessment: 'Batuk kering post-infeksi viral', plan: 'Dextromethorphan 15mg 3x sehari, banyak minum air hangat, vitamin C', bpSystolic: 122, bpDiastolic: 78, temperature: 37.2, respiratoryRate: 20, heartRate: 82, spo2: 98, weight: 68, height: 168, diagnosisCode: 'R05.1' },
    { subjective: 'Pasien datang untuk kontrol diabetes, gula darah masih tinggi', objective: 'GDS: 220 mg/dL, tidak ada neuropati, tidak ada retinopati', assessment: 'Diabetes melitus tipe 2 - belum terkontrol', plan: 'Metformin 500mg 2x sehari, diet DM, olahraga 30 menit/hari, kontrol 2 minggu', bpSystolic: 130, bpDiastolic: 80, temperature: 36.6, respiratoryRate: 18, heartRate: 78, spo2: 98, weight: 78, height: 165, diagnosisCode: 'E11.9' },
    { subjective: 'Pasien mengeluh perih dan panas di area kulit lengan bawah kanan', objective: 'Eritema, vesikel kecil di lengan bawah kanan, dermatom T6-T8', assessment: 'Herpes zoster', plan: 'Acyclovir 400mg 5x sehari 7 hari, Paracetamol untuk nyeri, Mupirocin cream 3x sehari', bpSystolic: 120, bpDiastolic: 78, temperature: 36.8, respiratoryRate: 18, heartRate: 80, spo2: 99, weight: 62, height: 160, diagnosisCode: 'B02.9' },
    { subjective: 'Pasien datang dengan sariawan di mulu sejak 3 hari, sulit makan', objective: 'Ulkasi aphthous di mukosa bukal kiri, tidak ada lesi lain', assessment: 'Stomatitis aphthous', plan: 'Vitamin C 1000mg 1x sehari, Chlorhexidine mouthwash, hindari makanan asam/pedas', bpSystolic: 118, bpDiastolic: 75, temperature: 36.5, respiratoryRate: 16, heartRate: 74, spo2: 99, weight: 50, height: 152, diagnosisCode: 'K12.1' },
    { subjective: 'Pasien mengeluh sakit gigi geraham bawah kanan sejak 2 hari', objective: 'Gigi 46: karies profunda, perikoronitis ringan, servikal negatif', assessment: 'Pulpitis reversibel gigi 46', plan: 'Amoxicillin 500mg 3x sehari 5 hari, Ibuprofen 400mg 3x sehari, rujuk ke dokter gigi', bpSystolic: 130, bpDiastolic: 82, temperature: 36.7, respiratoryRate: 18, heartRate: 84, spo2: 98, weight: 72, height: 170, diagnosisCode: 'K04.0' },
    { subjective: 'Pasien mengeluh mata merah dan berair sejak kemarin', objective: 'OD: conjunctival injection++, tearing, visual acuity 6/6', assessment: 'Konjungtivitis alergi', plan: 'Cetirizine 10mg 1x sehari, kompres dingin, hindari mengucek mata', bpSystolic: 115, bpDiastolic: 74, temperature: 36.4, respiratoryRate: 16, heartRate: 72, spo2: 99, weight: 55, height: 158, diagnosisCode: 'H10.1' },
    { subjective: 'Pasien datang untuk vaksinasi influenza tahunan', objective: 'Keadaan umum baik, tidak ada kontraindikasi', assessment: 'Sehat - vaksinasi profilaksis', plan: 'Vaksinasi influenza, observasi 30 menit, paracetamol jika demam pasca vaksin', bpSystolic: 120, bpDiastolic: 78, temperature: 36.5, respiratoryRate: 16, heartRate: 74, spo2: 99, weight: 60, height: 158, diagnosisCode: 'Z23' },
    { subjective: 'Pasien mengeluh insomnia sejak 2 minggu, sulit tidur malam', objective: 'Pasien tampak lelah, tidak ada tanda depresi', assessment: 'Insomnia primer', plan: 'Higiene tidur, hindari kafein sore hari, Loratadine jika perlu, evaluasi 2 minggu', bpSystolic: 118, bpDiastolic: 72, temperature: 36.6, respiratoryRate: 16, heartRate: 70, spo2: 99, weight: 58, height: 156, diagnosisCode: 'G47.0' },
    { subjective: 'Pasien mengeluh nyeri pinggang sejak mengangkat berat kemarin', objective: 'Inspeksi: postur membungkuk, palparasi: spasme paravertebral L4-L5', assessment: 'Lumbago akut', plan: 'Diclofenac 50mg 3x sehari 5 hari, istirahat, kompres hangat, fisioterapi jika perlu', bpSystolic: 125, bpDiastolic: 80, temperature: 36.5, respiratoryRate: 17, heartRate: 76, spo2: 98, weight: 80, height: 175, diagnosisCode: 'M54.5' },
    { subjective: 'Pasien datang dengan tangan gatal dan pecah-pecah sejak sebulan', objective: 'Kulit tangan: deskuamasi, fissure di telapak tangan, interdigital', assessment: 'Dishidrotic eczema', plan: 'Mupirocin cream 3x sehari, pelembab kulit, hindari deterjen, Cetirizine jika gatal', bpSystolic: 120, bpDiastolic: 76, temperature: 36.5, respiratoryRate: 16, heartRate: 74, spo2: 99, weight: 56, height: 155, diagnosisCode: 'L30.1' },
    { subjective: 'Pasien demam sejak semalam 38.5C, sakit badan, pilek', objective: 'Nasopharynx edematous, servikal negatif, paru bersih', assessment: 'Influenza', plan: 'Paracetamol 500mg 4x sehari, istirahat, banyak cairan, vitamin C 1000mg/hari', bpSystolic: 115, bpDiastolic: 75, temperature: 38.5, respiratoryRate: 20, heartRate: 88, spo2: 97, weight: 62, height: 162, diagnosisCode: 'J11.0' },
    { subjective: 'Pasien mengeluh gatal di area selangkangan sejak seminggu', objective: 'Intertrigo di regio inguinal bilateral, eritema, skuama', assessment: 'Tinea inguinalis', plan: 'Clotrimazole cream 2x sehari 2 minggu, jaga kebersihan, gunakan celana longgar', bpSystolic: 122, bpDiastolic: 78, temperature: 36.6, respiratoryRate: 17, heartRate: 76, spo2: 99, weight: 68, height: 168, diagnosisCode: 'B35.6' },
  ]

  const statusOptions: PrescriptionStatus[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'PROCESSED', 'PENDING', 'CANCELLED']

  for (let i = 0; i < 25; i++) {
    const dayOffset = Math.floor(Math.random() * 60)
    const patient = patients[i % patients.length]
    const soap = soapTemplates[i]
    const status = statusOptions[i % statusOptions.length]

    const visitDate = daysAgo(dayOffset)

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        visitDate,
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
        bloodPressureSystolic: soap.bpSystolic,
        bloodPressureDiastolic: soap.bpDiastolic,
        temperature: soap.temperature,
        respiratoryRate: soap.respiratoryRate,
        heartRate: soap.heartRate,
        spo2: soap.spo2,
        weight: soap.weight,
        height: soap.height,
        diagnosisCode: soap.diagnosisCode,
      },
    })

    if (status !== 'CANCELLED' || Math.random() > 0.5) {
      const prescription = await prisma.prescription.create({
        data: {
          recordId: record.id,
          patientId: patient.id,
          status,
          notes: i % 3 === 0 ? 'Obat diminum setelah makan' : i % 3 === 1 ? 'Sesuai resep dokter' : null,
          createdById: doctor.id,
          processedById: status !== 'PENDING' ? staff.id : null,
          createdAt: visitDate,
        },
      })

      const numItems = 1 + Math.floor(Math.random() * 3)
      const usedMeds = new Set<string>()
      for (let j = 0; j < numItems; j++) {
        let med: (typeof allMedicines)[0]
        do {
          med = allMedicines[Math.floor(Math.random() * allMedicines.length)]
        } while (usedMeds.has(med.id))
        usedMeds.add(med.id)

        const dosageOptions = [
          '1 tablet 3x sehari',
          '1 tablet 2x sehari',
          '1 tablet 1x sehari',
          '2 tablet 3x sehari',
          '1 tablet sebelum tidur',
          '1 tablet setelah makan',
          '1 kapsul 3x sehari',
          '1 kapsul 2x sehari',
          '1/2 tablet 3x sehari',
          '1 tablet 4x sehari',
        ]

        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            medicineId: med.id,
            dosage: dosageOptions[Math.floor(Math.random() * dosageOptions.length)],
            quantity: 5 + Math.floor(Math.random() * 20),
            notes: j === 0 ? 'Diminum setelah makan' : null,
          },
        })
      }
    }
  }

  console.log('Created 25 medical records with prescriptions')
  console.log('Seeding completed!')
  console.log('')
  console.log('=== LOGIN CREDENTIALS ===')
  console.log('Doctor: sovia@apotikv.com / k95')
  console.log('Staff:  staff@apotikv.com / password123')
  console.log('')
  console.log(`=== SUMMARY ===`)
  console.log(`Users:    2 (Doctor + Staff)`)
  console.log(`Patients: ${patients.length}`)
  console.log(`Medicines: ${totalInserted}`)
  console.log(`Records:  25`)

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
