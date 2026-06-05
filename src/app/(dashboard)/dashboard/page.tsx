import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Pill, AlertTriangle } from 'lucide-react'
import { getDashboardStats } from '@/server/actions/dashboard'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const result = await getDashboardStats()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading dashboard</p>
      </div>
    )
  }

  const stats = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Apotik-V Pharmacy Management System
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.patientsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.criticalStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.nearExpiryCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiring within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingPrescriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/inventory" />}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockMedicines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-xs text-muted-foreground">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {medicine.stockQty} {medicine.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
              <CardTitle>Near Expiry Items</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/inventory" />}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.nearExpiryMedicines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No near expiry items</p>
            ) : (
              <div className="space-y-3">
                {stats.nearExpiryMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-xs text-muted-foreground">{medicine.batchNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {format(new Date(medicine.expiryDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
            <CardTitle>Recent Prescriptions</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/prescriptions" />}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentPrescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prescriptions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{prescription.patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      by {prescription.createdBy.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      prescription.status === 'PENDING' ? 'text-yellow-600' :
                      prescription.status === 'COMPLETED' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {prescription.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
