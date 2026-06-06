import { getAuditLogs } from '@/server/actions/audit-logs'
import { AuditLogList } from '@/components/features/audit-logs/audit-log-list'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; userId?: string; page?: string }>
}) {
  const params = await searchParams
  const entity = params.entity || ''
  const userId = params.userId || ''
  const page = Number(params.page) || 1

  const result = await getAuditLogs({ entity, userId, page, limit: 50 })

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {result.error === 'Forbidden: Only doctors can view audit logs'
            ? 'You do not have permission to view audit logs'
            : 'Error loading audit logs'}
        </p>
      </div>
    )
  }

  return (
    <AuditLogList
      key={`${entity}-${page}`}
      initialLogs={result.data as any}
      pagination={result.pagination!}
      entity={entity}
    />
  )
}
