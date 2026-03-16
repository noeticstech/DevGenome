import { getOperationalSummary } from './operations/operationalSummaryService'

export async function getHealthStatus() {
  const operationalSummary = await getOperationalSummary()

  return {
    status: operationalSummary.status,
    service: 'devgenome-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    checks: {
      database: operationalSummary.database,
      jobs: operationalSummary.jobs,
    },
    warnings: operationalSummary.warnings,
  }
}
