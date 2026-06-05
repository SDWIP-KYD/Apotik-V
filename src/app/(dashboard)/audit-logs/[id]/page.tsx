import { getAuditLogById } from '@/server/actions/audit-logs'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getAuditLogById(id)

  if (result.error || !result.data) {
    notFound()
  }

  const log = result.data

  function getActionColor(action: string) {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/audit-logs" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Audit Log Detail</h1>
          <p className="text-muted-foreground">
            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>User:</strong> {log.user.name} ({log.user.email})</p>
            <p>
              <strong>Action:</strong>{' '}
              <Badge className={getActionColor(log.action)}>{log.action}</Badge>
            </p>
            <p><strong>Entity:</strong> {log.entity}</p>
            <p><strong>Entity ID:</strong> {log.entityId}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes</CardTitle>
          </CardHeader>
          <CardContent>
            {log.oldValues && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Previous Values:</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(log.oldValues, null, 2)}
                </pre>
              </div>
            )}
            {log.newValues && (
              <div>
                <h3 className="text-sm font-semibold mb-2">New Values:</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(log.newValues, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
