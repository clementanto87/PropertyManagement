# Domain outline

This document maps initial domain modules and entities to planned API surfaces.

## Modules and core entities

- Properties
  - Entities: Property
  - Relations: Property has many Units, Documents, Expenses
  - Initial endpoints:
    - GET /api/properties
    - POST /api/properties
    - GET /api/properties/:id
    - PATCH /api/properties/:id
    - DELETE /api/properties/:id

- Units
  - Entities: Unit
  - Relations: Unit belongs to Property; has Leases, WorkOrders, Media, MaintenanceHistory
  - Initial endpoints:
    - GET /api/units
    - POST /api/units
    - GET /api/units/:id
    - PATCH /api/units/:id
    - DELETE /api/units/:id

- Tenants
  - Entities: Tenant, Communication
  - Relations: Tenant has Leases and Communications
  - Initial endpoints:
    - GET /api/tenants
    - POST /api/tenants
    - GET /api/tenants/:id
    - PATCH /api/tenants/:id
    - DELETE /api/tenants/:id

- Leases
  - Entities: Lease, Document, Payment
  - Relations: Lease belongs to Unit and Tenant; has Payments and Documents
  - Initial endpoints:
    - GET /api/leases
    - POST /api/leases
    - GET /api/leases/:id
    - PATCH /api/leases/:id
    - DELETE /api/leases/:id

- Work Orders
  - Entities: WorkOrder, Vendor, Media
  - Relations: WorkOrder belongs to Unit; optionally Vendor; has Media
  - Initial endpoints:
    - GET /api/work-orders
    - POST /api/work-orders
    - GET /api/work-orders/:id
    - PATCH /api/work-orders/:id
    - DELETE /api/work-orders/:id

- Expenses
  - Entities: Expense
  - Relations: Expense belongs to Property
  - Initial endpoints:
    - GET /api/expenses
    - POST /api/expenses
    - GET /api/expenses/:id
    - PATCH /api/expenses/:id
    - DELETE /api/expenses/:id

- Users and RBAC (Phase 2)
  - Entities: User, AuditLog, Role enum
  - Initial endpoints (placeholder):
    - GET /api/users
    - POST /api/users
    - RBAC middleware scaffolding

## Notes
- Validation: use zod schemas per resource for create/update.
- Pagination/filtering: support common `?page, ?limit, ?q` for list endpoints.
- Ordering: support `?orderBy=field&order=asc|desc`.
- Error handling: consistent JSON error shapes via centralized middleware.
