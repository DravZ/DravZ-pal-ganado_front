# Mapa de rutas y contrato sugerido para el backend

## Estado actual

El frontend aún no tiene un cliente HTTP general y la mayoría de las pantallas usan datos de prueba y estado local; el registro inicial sí está conectado a `POST /api/v1/registrations`. El backend también expone autenticación por sesión, `/api/v1/me` y recursos de dominio, pero algunas rutas del mapa siguen pendientes de completar o conectar. Los paths visibles para usuarios son rutas de React Router y están declarados en `src/routes/AppRouter.tsx`.

Se recomienda prefijar la API con `/api/v1`, usar JSON (`Content-Type: application/json`), UUID para identificadores y fechas ISO 8601. Los `POST` deben omitir `id`, `created_at` y otros campos generados por el servidor, salvo que el contrato de negocio indique lo contrario.

En desarrollo, Vite reenvía `/api` a `http://localhost:8080`; se puede cambiar el destino con `VITE_BACKEND_PROXY_TARGET`. Para despliegues, `VITE_API_BASE_URL` define la URL base de la API y debe apuntar a un backend accesible desde el navegador. El registro obtiene primero el token CSRF y lo envía junto con la cookie de sesión.

## Mapa de pantallas a recursos

| Ruta frontend | Pantalla | Recursos/endpoints sugeridos |
|---|---|---|
| `/`, `/login` | Inicio de sesión | `POST /api/v1/auth/session` |
| `/forgot-password` | Recuperar contraseña | `POST /api/v1/auth/password-resets` |
| `/register` | Alta inicial | Implementado: `POST /api/v1/registrations` |
| `/dashboard` | Resumen | `GET /api/v1/dashboard?farm_id={id}` |
| `/hato/animales` | Directorio de animales | `GET /api/v1/animals?farm_id={id}` |
| `/hato/nuevo` | Alta de animal | `POST /api/v1/animals` |
| `/hato/animales/:id` | Detalle de animal | `GET /api/v1/animals/{id}` |
| `/hato/pesajes` | Pesajes | `GET /api/v1/animal-weights?animal_id={id}`, `POST /api/v1/animal-weights` |
| `/hato/reproduccion` | Reproducción | `GET /api/v1/reproductive-events?farm_id={id}`, `POST /api/v1/reproductive-events` |
| `/hato/traslados` | Traslados y ventas | `GET, POST /api/v1/movements`; `GET, POST /api/v1/sales` |
| `/salud/eventos` | Eventos de salud | `GET, POST /api/v1/health-events` |
| `/salud/tratamientos` | Evento y tratamiento | `POST /api/v1/health-events` y `POST /api/v1/treatments` |
| `/salud/vacunacion` | Vacunación | `GET, POST /api/v1/vaccinations` |
| `/alimentacion/diaria` | Alimentación y producción | `GET, POST /api/v1/feeding-records`; `GET, POST /api/v1/production-records` |
| `/alimentacion/inventario` | Inventario y compras | `GET, POST /api/v1/products`; `GET, POST /api/v1/purchases` |
| `/finanzas/gastos` | Gastos y asignaciones | `GET, POST /api/v1/expenses`; `GET, POST /api/v1/cost-allocations` |
| `/admin/estructura` | Potreros | `GET, POST /api/v1/paddocks` |
| `/admin/configuracion` | Configuración | `GET, PATCH /api/v1/organizations/{id}` |
| `/organizacion/informacion` | Información de organización | `GET /api/v1/organizations/{id}` |
| `/organizacion/editar` | Editar organización | `PATCH /api/v1/organizations/{id}` |
| `/admin/usuarios` | Usuarios | `GET /api/v1/users?organization_id={id}` |
| `/usuarios/nuevo` | Alta de usuario | `POST /api/v1/users` |
| `/usuarios/:id` | Detalle de usuario | `GET /api/v1/users/{id}` |
| `/usuarios/editar/:id` | Editar usuario | `PATCH /api/v1/users/{id}` |
| `/admin/fincas` | Fincas | `GET /api/v1/farms?organization_id={id}` |
| `/fincas/nueva` | Alta de finca | `POST /api/v1/farms` |
| `/fincas/:id` | Detalle de finca | `GET /api/v1/farms/{id}` |
| `/fincas/editar/:id` | Editar finca | `PATCH /api/v1/farms/{id}` |
| `/admin/alertas` | Alertas | `GET /api/v1/alerts?farm_id={id}`; `PATCH /api/v1/alerts/{id}` |
| `/admin/sincronizacion` | Cola offline | `GET /api/v1/sync-queue`; `POST /api/v1/sync-queue/batch` |
| `/perfil` | Perfil actual | `GET /api/v1/me` |
| `/perfil/editar` | Editar perfil | `PATCH /api/v1/me` |
| `*` | No encontrada | Sin endpoint |

### Endpoints auxiliares recomendados

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/v1/auth/session` | Implementado: recibe `{ "email", "password" }`, crea sesión HTTP y devuelve el usuario. |
| `DELETE` | `/api/v1/auth/session` | Implementado: cierra la sesión actual. |
| `GET` | `/api/v1/auth/csrf` | Implementado: emite la cookie `XSRF-TOKEN` y devuelve el token; enviar su valor en `X-XSRF-TOKEN` al hacer solicitudes que modifican datos. |
| `POST` | `/api/v1/auth/password-resets` | Implementado como respuesta genérica; el envío real de instrucciones requiere integrar un proveedor de correo y flujo de restablecimiento. |
| `POST` | `/api/v1/registrations` | Implementado: crea de forma atómica la organización, la primera finca (si se envía) y el usuario administrador. |
| `GET` | `/api/v1/me` | Implementado: devuelve el usuario de la sesión autenticada. |
| `GET` | `/api/v1/dashboard?farm_id={id}` | Agregados para tarjetas y gráficas del inicio. |
| `GET` | `/api/v1/lots?farm_id={id}` | Lotes para formularios, traslados y alimentación. |
| `GET` | `/api/v1/customers?organization_id={id}` | Catálogo de clientes para ventas. |
| `GET` | `/api/v1/suppliers?organization_id={id}` | Catálogo de proveedores para compras y gastos. |
| `GET` | `/api/v1/medications` | Catálogo de medicamentos para tratamientos. |

Para listados, aceptar paginación (`page`, `page_size`), filtros por IDs/estado y búsqueda (`q`). Responder con `{ "data": [], "page": 1, "page_size": 25, "total": 0 }`. Para errores, usar un estado HTTP apropiado y `{ "error": { "code": "...", "message": "...", "details": {} } }`.

## Modelos y ejemplos JSON

Los nombres y propiedades siguientes corresponden a las interfaces de `src/types/database.types.ts`. Los ejemplos son objetos de respuesta completos de referencia; para crear registros se pueden omitir campos generados por el servidor y los campos opcionales no aplicables.

```json
{
  "Organization": {
    "id": "org-uuid",
    "name": "Rancho Esperanza",
    "legal_name": "Rancho Esperanza S.A.",
    "tax_id": "RFC123456",
    "phone": "+52 555 000 0000",
    "email": "contacto@rancho.mx",
    "status": "active",
    "created_at": "2026-01-15T12:00:00Z"
  },
  "User": {
    "id": "user-uuid",
    "organization_id": "org-uuid",
    "name": "Rafael Mendes",
    "email": "rafael@rancho.mx",
    "phone": "+52 555 000 0001",
    "status": "active",
    "created_at": "2026-01-15T12:00:00Z"
  },
  "Farm": {
    "id": "farm-uuid",
    "organization_id": "org-uuid",
    "name": "Finca Norte",
    "code": "FIN-001",
    "state": "Jalisco",
    "municipality": "Tepatitlán",
    "locality": "Los Altos",
    "address": "Carretera principal km 10",
    "hectares": 120.5,
    "status": "active",
    "created_at": "2026-01-15T12:00:00Z"
  },
  "Paddock": {
    "id": "paddock-uuid",
    "farm_id": "farm-uuid",
    "name": "Potrero Norte",
    "code": "POT-01",
    "hectares": 48,
    "capacity": 72,
    "forage_type": "Brachiaria",
    "status": "active"
  },
  "Lot": {
    "id": "lot-uuid",
    "farm_id": "farm-uuid",
    "name": "Lote de cría",
    "code": "LOT-01",
    "lot_type": "Cría",
    "purpose": "Producción",
    "current_paddock_id": "paddock-uuid",
    "start_date": "2026-01-15",
    "status": "active",
    "notes": ""
  },
  "Animal": {
    "id": "animal-uuid",
    "farm_id": "farm-uuid",
    "name": "Esperanza",
    "sex": "Hembra",
    "species": "bovino",
    "breed": "Nelore",
    "birth_date": "2022-03-10",
    "birth_weight": 32,
    "current_lot_id": "lot-uuid",
    "current_paddock_id": "paddock-uuid",
    "status": "active",
    "current_weight": 420,
    "current_weight_date": "2026-02-01",
    "acquisition_date": "2022-03-10",
    "acquisition_cost": 12000,
    "notes": "",
    "created_at": "2022-03-10T12:00:00Z"
  },
  "AnimalIdentifier": {
    "id": "identifier-uuid",
    "animal_id": "animal-uuid",
    "identifier_type": "ARETE_VISUAL",
    "identifier": "BR-1042",
    "is_current": true,
    "is_official": false
  },
  "AnimalEvent": {
    "id": "event-uuid",
    "animal_id": "animal-uuid",
    "event_type": "TRASLADO",
    "event_date": "2026-02-01T10:00:00Z",
    "lot_id": "lot-uuid",
    "paddock_id": "paddock-uuid",
    "user_id": "user-uuid",
    "description": "Cambio de lote",
    "metadata": {},
    "created_at": "2026-02-01T10:00:00Z"
  },
  "AnimalWeight": {
    "id": "weight-uuid",
    "animal_id": "animal-uuid",
    "weight": 420,
    "measured_at": "2026-02-01T10:00:00Z",
    "method": "Báscula digital",
    "user_id": "user-uuid",
    "notes": ""
  },
  "HealthEvent": {
    "id": "health-event-uuid",
    "animal_id": "animal-uuid",
    "event_type": "Enfermedad",
    "event_date": "2026-02-01T10:00:00Z",
    "diagnosis": "Infección",
    "symptoms": "Fiebre",
    "result": "En tratamiento",
    "veterinarian_name": "Dra. López",
    "notes": ""
  },
  "Medication": {
    "id": "medication-uuid",
    "name": "Antibiótico",
    "active_ingredient": "Principio activo",
    "presentation": "Frasco",
    "concentration": "10%",
    "route": "Intramuscular",
    "withdrawal_days_meat": 5,
    "withdrawal_days_milk": 3,
    "status": "active"
  },
  "Treatment": {
    "id": "treatment-uuid",
    "animal_id": "animal-uuid",
    "health_event_id": "health-event-uuid",
    "medication_id": "medication-uuid",
    "start_date": "2026-02-01T10:00:00Z",
    "end_date": "2026-02-05T10:00:00Z",
    "dose": 20,
    "dose_unit": "mL",
    "frequency": "Cada 24 horas",
    "route": "Intramuscular",
    "withdrawal_until": "2026-02-10",
    "status": "ACTIVO",
    "notes": ""
  },
  "Vaccination": {
    "id": "vaccination-uuid",
    "animal_id": "animal-uuid",
    "vaccine_name": "Vacuna bovina",
    "manufacturer": "Laboratorio",
    "application_date": "2026-02-01T10:00:00Z",
    "next_due_date": "2027-02-01",
    "dose": 2,
    "dose_unit": "mL",
    "veterinarian_name": "Dra. López",
    "notes": ""
  },
  "ReproductiveEvent": {
    "id": "reproductive-event-uuid",
    "female_animal_id": "animal-uuid",
    "male_animal_id": "animal-uuid",
    "event_type": "Inseminación",
    "event_date": "2026-02-01",
    "service_type": "Inseminación artificial",
    "expected_date": "2026-11-10",
    "result": "Pendiente",
    "notes": ""
  },
  "FeedingRecord": {
    "id": "feeding-uuid",
    "farm_id": "farm-uuid",
    "lot_id": "lot-uuid",
    "product_id": "product-uuid",
    "feeding_date": "2026-02-01",
    "quantity": 120,
    "unit": "kg",
    "cost": 480,
    "notes": ""
  },
  "Product": {
    "id": "product-uuid",
    "organization_id": "org-uuid",
    "name": "Alimento balanceado",
    "sku": "ALI-001",
    "category": "Alimento",
    "product_type": "Insumo",
    "unit": "kg",
    "current_stock": 500,
    "minimum_stock": 50,
    "reorder_point": 100,
    "average_cost": 4.25,
    "status": "active"
  },
  "InventoryMovement": {
    "id": "inventory-movement-uuid",
    "product_id": "product-uuid",
    "movement_type": "ENTRADA",
    "quantity": 100,
    "unit_cost": 4.25,
    "movement_date": "2026-02-01T10:00:00Z",
    "reference_type": "PURCHASE",
    "reference_id": "purchase-uuid",
    "user_id": "user-uuid",
    "notes": ""
  },
  "Supplier": {
    "id": "supplier-uuid",
    "organization_id": "org-uuid",
    "name": "Proveedor del Norte",
    "legal_name": "Proveedor del Norte S.A.",
    "tax_id": "RFC654321",
    "phone": "+52 555 000 0002",
    "email": "ventas@proveedor.mx",
    "status": "active"
  },
  "Purchase": {
    "id": "purchase-uuid",
    "farm_id": "farm-uuid",
    "supplier_id": "supplier-uuid",
    "purchase_date": "2026-02-01",
    "invoice_number": "F-100",
    "subtotal": 400,
    "tax": 64,
    "total": 464,
    "payment_status": "Pendiente",
    "notes": ""
  },
  "PurchaseLine": {
    "id": "purchase-line-uuid",
    "purchase_id": "purchase-uuid",
    "product_id": "product-uuid",
    "quantity": 100,
    "unit_price": 4,
    "subtotal": 400
  },
  "ProductionRecord": {
    "id": "production-uuid",
    "farm_id": "farm-uuid",
    "animal_id": "animal-uuid",
    "lot_id": "lot-uuid",
    "production_date": "2026-02-01",
    "production_type": "LECHE",
    "quantity": 1320,
    "unit": "litros",
    "price_per_unit": 2.05,
    "revenue": 2706,
    "notes": ""
  },
  "Expense": {
    "id": "expense-uuid",
    "farm_id": "farm-uuid",
    "supplier_id": "supplier-uuid",
    "expense_date": "2026-02-01",
    "category": "Alimentación",
    "description": "Compra de alimento",
    "amount": 464,
    "reference_type": "PURCHASE",
    "reference_id": "purchase-uuid",
    "status": "Pagado"
  },
  "CostAllocation": {
    "id": "allocation-uuid",
    "farm_id": "farm-uuid",
    "expense_id": "expense-uuid",
    "animal_id": "animal-uuid",
    "lot_id": "lot-uuid",
    "allocation_type": "ANIMAL",
    "amount": 464,
    "allocation_date": "2026-02-01",
    "notes": ""
  },
  "Customer": {
    "id": "customer-uuid",
    "organization_id": "org-uuid",
    "name": "Cliente local",
    "legal_name": "Cliente local S.A.",
    "tax_id": "RFC123789",
    "phone": "+52 555 000 0003",
    "email": "compras@cliente.mx",
    "status": "active"
  },
  "Sale": {
    "id": "sale-uuid",
    "farm_id": "farm-uuid",
    "customer_id": "customer-uuid",
    "sale_number": "VEN-2026-0001",
    "sale_date": "2026-02-01",
    "subtotal": 20000,
    "tax": 3200,
    "total": 23200,
    "payment_status": "Pendiente",
    "notes": ""
  },
  "SaleLine": {
    "id": "sale-line-uuid",
    "sale_id": "sale-uuid",
    "animal_id": "animal-uuid",
    "quantity": 1,
    "weight": 420,
    "unit_price": 47.62,
    "subtotal": 20000
  },
  "Movement": {
    "id": "movement-uuid",
    "farm_id": "farm-uuid",
    "origin_lot_id": "lot-uuid",
    "destination_lot_id": "lot-uuid",
    "movement_date": "2026-02-01T10:00:00Z",
    "movement_type": "TRASLADO",
    "reason": "Rotación",
    "status": "COMPLETADO",
    "notes": ""
  },
  "MovementAnimal": {
    "id": "movement-animal-uuid",
    "movement_id": "movement-uuid",
    "animal_id": "animal-uuid",
    "weight": 420
  },
  "Alert": {
    "id": "alert-uuid",
    "farm_id": "farm-uuid",
    "animal_id": "animal-uuid",
    "alert_type": "VACUNACION",
    "severity": "MEDIA",
    "title": "Vacuna próxima",
    "message": "Aplicar refuerzo",
    "detected_at": "2026-02-01T10:00:00Z",
    "due_date": "2026-02-10T10:00:00Z",
    "status": "open"
  },
  "SyncQueueEntry": {
    "id": "sync-uuid",
    "entity_name": "production_records",
    "entity_id": "production-uuid",
    "operation_type": "CREATE",
    "payload": {
      "farm_id": "farm-uuid",
      "production_type": "LECHE",
      "production_date": "2026-02-01",
      "quantity": 1320
    },
    "status": "PENDING",
    "retry_count": 0,
    "created_at": "2026-02-01T10:00:00Z"
  }
}
```

### Payloads compuestos ya definidos

`CreateMovementDTO` agrupa los campos de `Movement` (sin `id`) y `animals: [{ "animal_id": "...", "weight": 420 }]`. `CreateSaleDTO` agrupa los campos de `Sale` (sin `id`) y `lines: [{ "item_type": "ANIMAL", "animal_id": "...", "quantity": 1, "weight": 420, "unit_price": 47.62, "subtotal": 20000 }]`.

## Decisiones que requieren definición de backend

- `User` no define `role` ni `farm_id`, aunque algunos formularios de administración envían esos campos. Conviene modelar permisos y asignaciones a fincas como entidades/relaciones propias en lugar de persistirlos silenciosamente en `users`.
- Los formularios de reproducción y el historial de ventas tienen campos de interfaz que no siempre coinciden con el modelo; usar `ReproductiveEvent.result` y `actual_date`, y alinear los DTOs de venta con `SaleLine.item_type` antes de implementar los controladores.
- La interfaz simula modo offline mediante `SyncQueueEntry`; definir política de conflictos, reintentos, idempotencia y autorización en el endpoint batch antes de sincronizar datos.
