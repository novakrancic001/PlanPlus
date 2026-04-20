Sumiranje — PlanPlus Chat 2
Kontekst
Chat 2 — Backend autorizacija (@PreAuthorize po rolama, assignedTo na WorkOrder, workload semafor).

Šta je završeno u Chat-u 2

Faza 1: WorkOrder entitet — assignedTo polje

WorkOrder.java dobio @ManyToOne User assignedTo (nullable, JoinColumn = assigned_to)
Uklonjen dead import jdk.jfr.Unsigned
Cross-package referenca: com.aups.planplus.model → com.aups.planplus.auth.model.User (standardni Java import, nema problema)

Faza 2: WorkOrderResponse DTO

dto/WorkOrderResponse.java — polja: id, productId, productName, quantity, status, createdAt, assignedTo (UserResponse nullable)
Statički from(WorkOrder) factory, koristi UserResponse.from() za assignedTo
WorkOrderService i WorkOrderController refaktorisani da vraćaju WorkOrderResponse umesto WorkOrder entiteta

Faza 3: @PreAuthorize na svim endpointima

AuthController.register() → @PreAuthorize("hasRole('ADMIN')")
MaterialController, ProductController, InventoryController → @PreAuthorize("hasRole('PLANNER')") na nivou klase
BOMItemController: POST → hasRole('PLANNER'), GET /product/{id} → hasAnyRole('PLANNER','OPERATOR')
WorkOrderController: GET lista i GET /{id} → hasAnyRole('PLANNER','OPERATOR'), ostalo → hasRole('PLANNER')

Faza 4: Filtriranje i GET /{id}

WorkOrderRepository dobio: findByAssignedTo(User), findByIdAndAssignedTo(Long, User)
WorkOrderService.getAllWorkOrders(Authentication) — OPERATOR vidi samo svoje, PLANNER/ADMIN vide sve
WorkOrderService.getWorkOrderById(Long, Authentication) — OPERATOR dobija 403 za tuđi nalog (AccessDeniedException)
WorkOrderController dobio GET /{id} endpoint
Authentication se prosleđuje kao parametar iz kontrolera (čisto, testabilno)

Faza 5: Assign endpoint

dto/AssignRequest.java — { operatorId: Long }
WorkOrderService.assignWorkOrder(Long workOrderId, Long operatorId):
  - 404 ako korisnik ne postoji
  - 400 ako korisnik nije OPERATOR
  - 400 ako je nalog COMPLETED ili CANCELLED
  - 400 ako je nalog već dodeljen istom operateru
  - Reassign na drugog operatera je dozvoljen (200 OK)
PUT /api/work-orders/{id}/assign → hasRole('PLANNER')

Faza 6: Workload semafor

Novi paket: com.aups.planplus.workload
LoadStatus.java enum: GREEN (0-2), ORANGE (3-5), RED (6+) sa displayColor ("zelena", "narandžasta", "crvena") i fromCount(int) factory
OperatorWorkloadDTO.java: id, username, firstName, lastName, activeOrders, loadStatus, displayColor; statički of(User, int) factory
WorkloadService.java: dohvata sve OPERATOR korisnike, broji aktivne naloge (PLANNED + IN_PROGRESS) po operateru
WorkloadController.java: GET /api/operators/workload → hasRole('PLANNER')
WorkOrderRepository dobio: countByAssignedToAndStatusIn(User, List<OrderStatus>)

Poznate odluke i konvencije iz Chat-a 2

Authentication se uvek prosleđuje kao parametar iz kontrolera u servis, nikad SecurityContextHolder direktno
AccessDeniedException iz Spring Security koristi se za 403 u servisima (GlobalExceptionHandler već mapira)
IllegalArgumentException → 400 za sve biznis-validacije (konzistentno sa Chat 1)
UserRepository.findAll() + filter u memoriji je OK za workload (mali broj operatera na akademskom projektu)

Sledeće — Chat 3: Backend paginacija, sortiranje, pretraga

Pageable na svim list endpointima (getAllMaterials, getAllProducts, getAllWorkOrders, getAllInventory)
Sortiranje i filtriranje po relevantnim poljima
Specification ili @Query za složenije pretrage