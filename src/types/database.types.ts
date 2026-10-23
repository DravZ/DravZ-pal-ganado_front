/**
 * PA LA VACA (AREVIA MVP) - TIPOS CENTRALIZADOS DE BASE DE DATOS
 * Fuente de verdad técnica basada en las 23 tablas DBML del sistema.
 */

// ==========================================
// 01. ORGANIZACIÓN Y USUARIOS
// ==========================================

export interface Organization {
  id: string; // uuid [pk]
  name: string; // varchar(150) [not null]
  legal_name?: string; // varchar(200)
  tax_id?: string; // varchar(30)
  phone?: string; // varchar(30)
  email?: string; // varchar(150)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
  created_at: string; // timestamp
  updated_at?: string; // timestamp
}

export interface User {
  id: string; // uuid [pk]
  organization_id: string; // uuid [ref: > organizations.id]
  name: string; // varchar(150) [not null]
  email: string; // varchar(150) [not null, unique]
  phone?: string; // varchar(30)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
  created_at: string; // timestamp
  updated_at?: string; // timestamp
}

// ==========================================
// 02. RANCHO Y INFRAESTRUCTURA
// ==========================================

export interface Farm {
  id: string; // uuid [pk]
  organization_id: string; // uuid [ref: > organizations.id]
  name: string; // varchar(150) [not null]
  code?: string; // varchar(50)
  state?: string; // varchar(100)
  municipality?: string; // varchar(100)
  locality?: string; // varchar(100)
  address?: string; // text
  hectares?: number; // decimal(12,2)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
  created_at: string; // timestamp
  updated_at?: string; // timestamp
  deleted_at?: string; // timestamp
}

export interface Paddock {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  name: string; // varchar(150) [not null]
  code?: string; // varchar(50)
  hectares?: number; // decimal(12,2)
  capacity?: number; // decimal(12,2)
  forage_type?: string; // varchar(100)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
}

// ==========================================
// 03. LOTES
// ==========================================

export interface Lot {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  name: string; // varchar(150) [not null]
  code?: string; // varchar(50)
  lot_type?: string; // varchar(50)
  purpose?: string; // varchar(100)
  current_paddock_id?: string; // uuid [ref: > paddocks.id]
  start_date?: string; // date
  end_date?: string; // date
  status: 'active' | 'archived' | string; // varchar(30) [default: 'active']
  notes?: string; // text
  created_at: string; // timestamp
  updated_at?: string; // timestamp
}

// ==========================================
// 04. ANIMALES E IDENTIFICADORES
// ==========================================

export type AnimalSex = 'Macho' | 'Hembra' | 'macho' | 'hembra';

export interface Animal {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  name?: string; // varchar(100)
  sex: AnimalSex; // varchar(20) [not null]
  species: string; // varchar(50) [default: 'bovino']
  breed?: string; // varchar(100)
  birth_date?: string; // date
  birth_weight?: number; // decimal(10,2)
  sire_id?: string; // uuid [ref: > animals.id]
  dam_id?: string; // uuid [ref: > animals.id]
  current_lot_id?: string; // uuid [ref: > lots.id]
  current_paddock_id?: string; // uuid [ref: > paddocks.id]
  status: 'active' | 'sold' | 'deceased' | string; // varchar(50) [default: 'active']
  current_weight?: number; // decimal(10,2)
  current_weight_date?: string; // date
  acquisition_date?: string; // date
  acquisition_cost?: number; // decimal(14,2)
  notes?: string; // text
  created_at: string; // timestamp
  updated_at?: string; // timestamp
  deleted_at?: string; // timestamp
}

export interface AnimalIdentifier {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  identifier_type: 'SINIGA' | 'ARETE_VISUAL' | 'MICROCHIP' | 'HIERRO' | string; // varchar(50)
  identifier: string; // varchar(100) [not null]
  is_current: boolean; // default: true
  is_official: boolean; // default: false
  issue_date?: string; // date
}

// ==========================================
// 05. HISTORIAL Y TRAZABILIDAD DE ANIMALES
// ==========================================

export interface AnimalEvent {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  event_type: string; // varchar(80) [not null]
  event_date: string; // timestamp [not null]
  lot_id?: string; // uuid [ref: > lots.id]
  paddock_id?: string; // uuid [ref: > paddocks.id]
  user_id?: string; // uuid [ref: > users.id]
  description?: string; // text
  metadata?: Record<string, any>; // json
  created_at: string; // timestamp
}

export interface AnimalWeight {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  weight: number; // decimal(10,2) [not null]
  measured_at: string; // timestamp [not null]
  method?: 'Báscula digital' | 'Cinta métrica' | 'Estimación visual' | string; // varchar(50)
  user_id?: string; // uuid [ref: > users.id]
  notes?: string; // text
}

// ==========================================
// 06. SALUD Y TRATAMIENTOS
// ==========================================

export interface HealthEvent {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  event_type: string; // varchar(80) [not null]
  event_date: string; // timestamp [not null]
  diagnosis?: string; // text
  symptoms?: string; // text
  result?: string; // text
  veterinarian_name?: string; // varchar(150)
  notes?: string; // text
}

export interface Medication {
  id: string; // uuid [pk]
  name: string; // varchar(150) [not null]
  active_ingredient?: string; // varchar(150)
  presentation?: string; // varchar(100)
  concentration?: string; // varchar(100)
  route?: 'Subcutánea' | 'Intramuscular' | 'Oral' | 'Tópica' | 'Intrauterina' | string; // varchar(50)
  withdrawal_days_meat?: number; // int
  withdrawal_days_milk?: number; // int
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
}

export interface Treatment {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  health_event_id?: string; // uuid [ref: > health_events.id]
  medication_id: string; // uuid [ref: > medications.id]
  start_date: string; // timestamp [not null]
  end_date?: string; // timestamp
  dose?: number; // decimal(12,3)
  dose_unit?: 'mL' | 'mg' | 'g' | 'Dosis' | string; // varchar(30)
  frequency?: string; // varchar(50)
  route?: string; // varchar(50)
  withdrawal_until?: string; // date
  status?: 'ACTIVO' | 'COMPLETADO' | 'CANCELADO' | string; // varchar(30)
  notes?: string; // text
}

export interface Vaccination {
  id: string; // uuid [pk]
  animal_id: string; // uuid [ref: > animals.id]
  vaccine_name: string; // varchar(150) [not null]
  manufacturer?: string; // varchar(150)
  application_date: string; // timestamp [not null]
  next_due_date?: string; // date
  dose?: number; // decimal(10,3)
  dose_unit?: string; // varchar(30)
  veterinarian_name?: string; // varchar(150)
  notes?: string; // text
}

// ==========================================
// 07. REPRODUCCIÓN
// ==========================================

export type ReproductiveEventType = 'Celo' | 'Inseminación' | 'Monta natural' | 'Diagnóstico gestación' | 'Parto' | 'Aborto';

export interface ReproductiveEvent {
  id: string; // uuid [pk]
  female_animal_id: string; // uuid [ref: > animals.id]
  male_animal_id?: string; // uuid [ref: > animals.id]
  event_type: ReproductiveEventType | string; // varchar(80) [not null]
  event_date: string; // date [not null]
  service_type?: 'Inseminación artificial' | 'Monta natural' | 'IATF' | string; // varchar(50)
  expected_date?: string; // date
  actual_date?: string; // date
  result?: 'Confirmado' | 'Proyectado' | 'Fallido' | 'Pendiente' | string; // varchar(50)
  notes?: string; // text
}

// ==========================================
// 08. ALIMENTACIÓN
// ==========================================

export interface FeedingRecord {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  lot_id?: string; // uuid [ref: > lots.id]
  animal_id?: string; // uuid [ref: > animals.id]
  product_id?: string; // uuid [ref: > products.id]
  feeding_date: string; // date [not null]
  quantity: number; // decimal(14,3) [not null]
  unit?: string; // varchar(30)
  cost?: number; // decimal(14,2)
  notes?: string; // text
}

// ==========================================
// 09. INVENTARIO DE PRODUCTOS Y MOVIMIENTOS
// ==========================================

export interface Product {
  id: string; // uuid [pk]
  organization_id: string; // uuid [ref: > organizations.id]
  name: string; // varchar(150) [not null]
  sku?: string; // varchar(80)
  category?: string; // varchar(80)
  product_type?: string; // varchar(80)
  unit?: string; // varchar(30)
  current_stock: number; // decimal(14,3) [default: 0]
  minimum_stock?: number; // decimal(14,3)
  reorder_point?: number; // decimal(14,3)
  average_cost?: number; // decimal(14,4)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
}

export interface InventoryMovement {
  id: string; // uuid [pk]
  product_id: string; // uuid [ref: > products.id]
  movement_type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | string; // varchar(50)
  quantity: number; // decimal(14,3) [not null]
  unit_cost?: number; // decimal(14,4)
  movement_date: string; // timestamp [not null]
  reference_type?: string; // varchar(50)
  reference_id?: string; // uuid
  user_id?: string; // uuid [ref: > users.id]
  notes?: string; // text
}

// ==========================================
// 10. PROVEEDORES Y COMPRAS
// ==========================================

export interface Supplier {
  id: string; // uuid [pk]
  organization_id: string; // uuid [ref: > organizations.id]
  name: string; // varchar(150) [not null]
  legal_name?: string; // varchar(200)
  tax_id?: string; // varchar(30)
  phone?: string; // varchar(30)
  email?: string; // varchar(150)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
}

export interface Purchase {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  supplier_id: string; // uuid [ref: > suppliers.id]
  purchase_date: string; // date [not null]
  invoice_number?: string; // varchar(100)
  subtotal?: number; // decimal(14,2)
  tax?: number; // decimal(14,2)
  total?: number; // decimal(14,2)
  payment_status?: 'Pagada' | 'Pendiente' | 'Anulada' | string; // varchar(30)
  notes?: string; // text
}

export interface PurchaseLine {
  id: string; // uuid [pk]
  purchase_id: string; // uuid [ref: > purchases.id]
  product_id: string; // uuid [ref: > products.id]
  quantity?: number; // decimal(14,3)
  unit_price?: number; // decimal(14,4)
  subtotal?: number; // decimal(14,2)
}

// ==========================================
// 11. PRODUCCIÓN (LECHE / CARNE / OTROS)
// ==========================================

export interface ProductionRecord {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  animal_id?: string; // uuid [ref: > animals.id]
  lot_id?: string; // uuid [ref: > lots.id]
  production_date: string; // date [not null]
  production_type: 'LECHE' | 'CARNE' | 'LANA' | string; // varchar(50)
  quantity: number; // decimal(14,3) [not null]
  unit?: string; // varchar(30)
  price_per_unit?: number; // decimal(14,4)
  revenue?: number; // decimal(14,2)
  notes?: string; // text
}

// ==========================================
// 12. FINANZAS Y GASTOS
// ==========================================

export interface Expense {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  supplier_id?: string; // uuid [ref: > suppliers.id]
  expense_date: string; // date [not null]
  category?: string; // varchar(80)
  description?: string; // text
  amount: number; // decimal(14,2) [not null]
  reference_type?: string; // varchar(50)
  reference_id?: string; // uuid
  status?: string; // varchar(30)
}

export interface CostAllocation {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  expense_id?: string; // uuid [ref: > expenses.id]
  animal_id?: string; // uuid [ref: > animals.id]
  lot_id?: string; // uuid [ref: > lots.id]
  allocation_type?: string; // varchar(50)
  amount: number; // decimal(14,2) [not null]
  allocation_date?: string; // date
  notes?: string; // text
}

// ==========================================
// 13. CLIENTES Y VENTAS
// ==========================================

export interface Customer {
  id: string; // uuid [pk]
  organization_id: string; // uuid [ref: > organizations.id]
  name: string; // varchar(150) [not null]
  legal_name?: string; // varchar(200)
  tax_id?: string; // varchar(30)
  phone?: string; // varchar(30)
  email?: string; // varchar(150)
  status: 'active' | 'inactive' | string; // varchar(30) [default: 'active']
}

export interface Sale {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  customer_id: string; // uuid [ref: > customers.id]
  sale_number?: string; // varchar(80)
  sale_date: string; // date [not null]
  subtotal?: number; // decimal(14,2)
  tax?: number; // decimal(14,2)
  total?: number; // decimal(14,2)
  payment_status?: 'Pagada' | 'Pendiente' | 'Anulada' | string; // varchar(30)
  notes?: string; // text
}

export interface SaleLine {
  id: string; // uuid [pk]
  sale_id: string; // uuid [ref: > sales.id]
  animal_id?: string; // uuid [ref: > animals.id]
  lot_id?: string; // uuid [ref: > lots.id]
  quantity?: number; // decimal(12,3)
  weight?: number; // decimal(12,2)
  unit_price?: number; // decimal(14,4)
  subtotal?: number; // decimal(14,2)
}

// ==========================================
// 14. MOVILIZACIÓN DE GANADO
// ==========================================

export interface Movement {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  origin_lot_id?: string; // uuid [ref: > lots.id]
  destination_lot_id?: string; // uuid [ref: > lots.id]
  movement_date: string; // timestamp [not null]
  movement_type: string; // varchar(50) [not null]
  reason?: string; // varchar(150)
  status?: string; // varchar(30)
  notes?: string; // text
}

export interface MovementAnimal {
  id: string; // uuid [pk]
  movement_id: string; // uuid [ref: > movements.id]
  animal_id: string; // uuid [ref: > animals.id]
  weight?: number; // decimal(12,2)
}

// ==========================================
// 15. ALERTAS DEL SISTEMA
// ==========================================

export interface Alert {
  id: string; // uuid [pk]
  farm_id: string; // uuid [ref: > farms.id]
  animal_id?: string; // uuid [ref: > animals.id]
  lot_id?: string; // uuid [ref: > lots.id]
  alert_type: string; // varchar(80) [not null]
  severity?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA' | string; // varchar(30)
  title: string; // varchar(200) [not null]
  message?: string; // text
  detected_at: string; // timestamp [not null]
  due_date?: string; // timestamp
  status: 'open' | 'resolved' | 'dismissed' | string; // varchar(30) [default: 'open']
  resolved_at?: string; // timestamp
  resolved_by?: string; // uuid [ref: > users.id]
}

// ==========================================
// 16. COLA DE SINCRONIZACIÓN OFFLINE
// ==========================================

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatusType = 'PENDING' | 'PROCESSING' | 'FAILED' | 'SYNCED';

export interface SyncQueueEntry<T = Record<string, any>> {
  id: string; // uuid [pk]
  entity_name: string; // varchar(50) [not null]
  entity_id: string; // uuid [not null]
  operation_type: SyncOperationType; // varchar(10)
  payload: T; // json [not null]
  status: SyncStatusType; // varchar(20) [default: 'PENDING']
  retry_count: number; // int [default: 0]
  error_message?: string; // text
  created_at: string; // timestamp
  processed_at?: string; // timestamp
}

// ==========================================
// UTILIDADES Y DTOs COMPUESTOS (PAYLOADS DE UI)
// ==========================================

/**
 * Payload completo para la creación de Movimientos con sus animales
 */
export interface CreateMovementDTO extends Omit<Movement, 'id'> {
  animals: {
    animal_id: string;
    weight?: number;
  }[];
}

/**
 * Payload completo para la creación de Ventas con sus líneas
 */
export interface CreateSaleDTO extends Omit<Sale, 'id'> {
  lines: {
    item_type: 'ANIMAL' | 'LOT';
    animal_id?: string;
    lot_id?: string;
    quantity: number;
    weight: number;
    unit_price: number;
    subtotal: number;
  }[];
}