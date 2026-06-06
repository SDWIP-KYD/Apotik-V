import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Pill, AlertTriangle } from 'lucide-react'
import { getDashboardStats } from '@/server/actions/dashboard'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const result = await getDashboardStats()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B7280] font-medium">Error loading dashboard</p>
      </div>
    )
  }

  const stats = result.data

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      sub: `${stats.patientsToday} today`,
      icon: Users,
      color: '#E63946',
      shadow: 'rgba(230,57,70,0.2)',
    },
    {
      title: 'Critical Stock',
      value: stats.criticalStockCount,
      sub: 'Items below threshold',
      icon: AlertTriangle,
      color: '#F4A261',
      shadow: 'rgba(244,162,97,0.2)',
    },
    {
      title: 'Near Expiry',
      value: stats.nearExpiryCount,
      sub: 'Expiring within 7 days',
      icon: Package,
      color: '#E76F51',
      shadow: 'rgba(231,111,81,0.2)',
    },
    {
      title: 'Pending Rx',
      value: stats.pendingPrescriptions,
      sub: 'Awaiting processing',
      icon: Pill,
      color: '#1D3557',
      shadow: 'rgba(29,53,87,0.15)',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E63946] flex items-center justify-center shadow-[0_4px_14px_rgba(230,57,70,0.3)]">
          <span className="text-white font-black text-lg">V</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1D3557] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#6B7280] font-medium">Apotik-V Pharmacy Management System</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="bauhaus-label text-[#6B7280]">{stat.title}</CardTitle>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}15`, boxShadow: `0 2px 8px ${stat.shadow}` }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#1D3557]">{stat.value}</div>
              <p className="text-xs font-medium text-[#6B7280] mt-1">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F4A261]" />
                Low Stock Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/inventory" />} className="text-xs font-bold text-[#1D3557]/60">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockMedicines.length === 0 ? (
              <p className="text-sm text-[#6B7280] font-medium py-4 text-center">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/40">
                    <div>
                      <p className="font-bold text-sm text-[#1D3557]">{medicine.name}</p>
                      <p className="text-xs text-[#6B7280] font-medium">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#F4A261]">
                        {medicine.stockQty} {medicine.unit}
                      </p>
                      <p className="text-[0.65rem] text-[#6B7280] font-semibold">
                        Min: {medicine.minThreshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Near Expiry Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E76F51]" />
                Near Expiry Items
              </CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/inventory" />} className="text-xs font-bold text-[#1D3557]/60">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.nearExpiryMedicines.length === 0 ? (
              <p className="text-sm text-[#6B7280] font-medium py-4 text-center">No near expiry items</p>
            ) : (
              <div className="space-y-3">
                {stats.nearExpiryMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/40">
                    <div>
                      <p className="font-bold text-sm text-[#1D3557]">{medicine.name}</p>
                      <p className="text-xs text-[#6B7280] font-medium">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#E76F51]">
                        {format(new Date(medicine.expiryDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-[0.65rem] text-[#6B7280] font-semibold">
                        {medicine.stockQty} {medicine.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1D3557]" />
              Recent Prescriptions
            </CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/prescriptions" />} className="text-xs font-bold text-[#1D3557]/60">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentPrescriptions.length === 0 ? (
            <p className="text-sm text-[#6B7280] font-medium py-4 text-center">No prescriptions yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/40 hover:bg-white/60 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-[#1D3557]">{prescription.patient.name}</p>
                    <p className="text-xs text-[#6B7280] font-medium">
                      by {prescription.createdBy.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      prescription.status === 'PENDING' ? 'warning' :
                      prescription.status === 'COMPLETED' ? 'success' :
                      'outline'
                    } className="text-[0.65rem]">
                      {prescription.status}
                    </Badge>
                    <p className="text-[0.65rem] text-[#6B7280] font-semibold mt-1">
                      {format(new Date(prescription.createdAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
