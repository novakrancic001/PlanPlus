# Chat 3 — Backend paginacija, sortiranje i pretraga

## Šta je urađeno

Svi GET list endpointi nadograđeni su da podržavaju paginaciju, sortiranje i pretragu.
Response format je Spring-ov `Page<T>` direktno (`content`, `totalElements`, `totalPages`, `number`, `size`).

### Arhitekturne odluke
- **Material / Product / Inventory** — derived query metode (`findByNameContainingIgnoreCase...`), bez Specification
- **WorkOrder** — `JpaSpecificationExecutor` + `WorkOrderSpec` klasa sa statičkim spec builder metodama
- **Workload** — in-memory sort po `activeOrders` (lista je uvek mala)
- **Default page size**: 20

---

## Promenjeni fajlovi

### Repositories
- `MaterialRepository` — dodat `findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(..., Pageable)`
- `ProductRepository` — dodat `findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(..., Pageable)`
- `InventoryRepository` — dodat `findByMaterialNameContainingIgnoreCaseOrMaterialSkuContainingIgnoreCase(..., Pageable)`
- `WorkOrderRepository` — doda `JpaSpecificationExecutor<WorkOrder>`

### Novi fajl
- `repository/WorkOrderSpec.java` — statički spec builder-i: `hasStatus`, `hasProduct`, `hasAssignedTo`, `assignedToUser`

### Services
- `MaterialService.getAllMaterials(String search, Pageable)` → `Page<Material>`
- `ProductService.getAllProducts(String search, Pageable)` → `Page<Product>`
- `InventoryService.getAllInventory(String search, Pageable)` → `Page<Inventory>`
- `WorkOrderService.getAllWorkOrders(auth, status, productId, assignedToId, Pageable)` → `Page<WorkOrderResponse>`

### Controllers
- `MaterialController` — `@PageableDefault(size=20, sort="name", ASC)`
- `ProductController` — `@PageableDefault(size=20, sort="name", ASC)` — uklonjen direktan inject `ProductRepository`
- `InventoryController` — `@PageableDefault(size=20, sort="currentStock", DESC)` — uklonjen direktan inject `InventoryRepository`
- `WorkOrderController` — `@PageableDefault(size=20, sort="createdAt", DESC)` + query params `status`, `productId`, `assignedToId`
- `WorkloadController` — `?sort=asc|desc` query param, default `desc`

---

## Endpointi — pregled

| Endpoint | Filter parametri | Default sort |
|---|---|---|
| `GET /api/materials` | `?search=` (name ili sku) | `name,asc` |
| `GET /api/products` | `?search=` (name ili sku) | `name,asc` |
| `GET /api/inventory` | `?search=` (material name ili sku) | `currentStock,desc` |
| `GET /api/work-orders` | `?status=`, `?productId=`, `?assignedToId=` | `createdAt,desc` |
| `GET /api/operators/workload` | `?sort=asc\|desc` | `activeOrders,desc` |

Paginacija se kontroliše standardno: `?page=0&size=10&sort=name,asc`

---

## Konvencije koje važe dalje

- OPERATOR filter na `/api/work-orders` ostao netaknut — Specification AND-uje `assignedTo = currentUser` automatski
- `Authentication` se i dalje prosleđuje kao parametar iz kontrolera u servis
- `IllegalArgumentException` → 400, `AccessDeniedException` → 403

---

## Šta je sledeće — Chat 4

**Angular frontend autentifikacija:**
- Login i register stranice
- `AuthInterceptor` — dodaje JWT token na svaki request
- `AuthGuard` — štiti rute od neautorizovanog pristupa
- Logout funkcionalnost