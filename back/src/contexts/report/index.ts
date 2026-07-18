export { createReportRouter } from './infrastructure/http/report.route';
export type { ReportUseCases } from './application/ReportUseCases';

// Wired (PR2b): `composition-root.ts` builds `container.report` from
// `MongooseMovementGateway` + `MongooseCategoryGateway` (report-local), and
// `_routes.ts` mounts `createReportRouter(getContainer().report)` at
// `/report`, replacing the legacy `modules/routes/report.route.ts` (design
// D13/D16). report has no domain/repository — no `ReportModel` export.
