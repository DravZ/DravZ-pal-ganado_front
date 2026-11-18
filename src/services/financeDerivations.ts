import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDatabase } from './offlineDatabase';
import { cachedFarmRecords, cachedOrganizationRecords } from './offlineRecords';
import type { HatoScope } from './hatoDataService';
import { amountValue, referenceKey, textValue } from '../utils/finance';

/**
 * Replica en el frontend los movimientos financieros que el backend genera a partir de las
 * operaciones del usuario (compra, venta, alimentación con costo, producción con ingresos y
 * alta de animal con costo de adquisición).
 *
 * Solo se derivan movimientos de registros que todavía no se han sincronizado. Mientras el
 * registro de origen es local, el gasto o ingreso correspondiente se muestra igualmente en
 * Finanzas. En cuanto el backend confirma la operación (el id pasa de `local:*` al UUID real)
 * y el movimiento real se identifica por `reference_type`/`reference_id`, el derivado
 * desaparece, de modo que nunca se duplica ni se inventan movimientos de registros ya
 * sincronizados.
 */
export interface DerivedFinanceMovements {
  expenses: Record<string, unknown>[];
  incomes: Record<string, unknown>[];
}

const EMPTY: DerivedFinanceMovements = { expenses: [], incomes: [] };

export function useDerivedFinanceMovements(scope: HatoScope | null): DerivedFinanceMovements {
  const derived = useLiveQuery(async () => {
    if (!scope) return EMPTY;
    const [expenses, financialRecords, feedings, purchases, sales, productions, animals, products] =
      await Promise.all([
        cachedFarmRecords(scope.userId, 'expenses', scope.farmId),
        cachedFarmRecords(scope.userId, 'financial_records', scope.farmId),
        cachedFarmRecords(scope.userId, 'feeding_records', scope.farmId),
        cachedFarmRecords(scope.userId, 'purchase_records', scope.farmId),
        cachedFarmRecords(scope.userId, 'sales_records', scope.farmId),
        cachedFarmRecords(scope.userId, 'production_records', scope.farmId),
        cachedFarmRecords(scope.userId, 'animals', scope.farmId),
        cachedOrganizationRecords(scope.userId, 'products'),
      ]);

    const pendingOperations = await offlineDatabase.syncQueue
      .where('userId')
      .equals(scope.userId)
      .toArray();
    const pendingKeys = new Set(
      pendingOperations
        .filter((operation) => operation.status === 'PENDING')
        .map((operation) => `${operation.resourceType}:${operation.recordId}`),
    );
    /** Un registro se deriva solo mientras sigue pendiente de sincronizarse. */
    const isPending = (resourceType: string, id: string): boolean => id.startsWith('local:')
      || pendingKeys.has(`${resourceType}:${id}`);

    const expenseReferences = new Set(
      expenses
        .map((expense) => referenceKey(expense.reference_type, expense.reference_id))
        .filter((key): key is string => key !== null),
    );
    const incomeReferences = new Set(
      financialRecords
        .map((record) => referenceKey(record.reference_type, record.reference_id))
        .filter((key): key is string => key !== null),
    );

    const derivedExpenses: Record<string, unknown>[] = [];
    const derivedIncomes: Record<string, unknown>[] = [];

    for (const feeding of feedings) {
      const amount = amountValue(feeding.cost);
      const id = textValue(feeding.id);
      if (amount <= 0 || !id || !isPending('feeding_records', id) || expenseReferences.has(`FEEDING:${id}`)) continue;
      const product = products.find((item) => textValue(item.id) === textValue(feeding.product_id));
      derivedExpenses.push({
        id: `derived:FEEDING:${id}`,
        farm_id: scope.farmId,
        expense_date: feeding.feeding_date,
        category: 'Alimentación',
        description: product ? `Alimentación - ${textValue(product.name)}` : 'Alimentación',
        amount,
        status: 'PENDING',
        reference_type: 'FEEDING',
        reference_id: feeding.id,
        derived: true,
      });
    }

    for (const purchase of purchases) {
      const amount = amountValue(purchase.total_amount ?? purchase.total);
      const id = textValue(purchase.id);
      if (amount <= 0 || !id || !isPending('purchase_records', id) || expenseReferences.has(`PURCHASE:${id}`)) continue;
      const invoice = textValue(purchase.invoice_number);
      derivedExpenses.push({
        id: `derived:PURCHASE:${id}`,
        farm_id: scope.farmId,
        supplier_id: purchase.supplier_id ?? null,
        expense_date: purchase.purchase_date,
        category: 'Compra',
        description: invoice ? `Compra ${invoice}` : 'Compra de insumos',
        amount,
        status: 'PENDING',
        reference_type: 'PURCHASE',
        reference_id: purchase.id,
        derived: true,
      });
    }

    for (const animal of animals) {
      const amount = amountValue(animal.acquisition_cost);
      const id = textValue(animal.id);
      if (amount <= 0 || !id || !isPending('animals', id) || expenseReferences.has(`ANIMAL:${id}`)) continue;
      derivedExpenses.push({
        id: `derived:ANIMAL:${id}`,
        farm_id: scope.farmId,
        expense_date: animal.acquisition_date,
        category: 'Adquisición de animal',
        description: `Alta de animal ${textValue(animal.tag_number ?? animal.identifier_tag)}`.trim(),
        amount,
        status: 'PENDING',
        reference_type: 'ANIMAL',
        reference_id: animal.id,
        derived: true,
      });
    }

    for (const sale of sales) {
      const amount = amountValue(sale.total_amount ?? sale.total);
      const id = textValue(sale.id);
      if (amount <= 0 || !id || !isPending('sales_records', id) || incomeReferences.has(`SALE:${id}`)) continue;
      const saleNumber = textValue(sale.sale_number);
      derivedIncomes.push({
        id: `derived:SALE:${id}`,
        farm_id: scope.farmId,
        record_date: sale.sale_date,
        transaction_type: 'INCOME',
        category: 'Venta',
        description: `Venta registrada${saleNumber ? ` (${saleNumber})` : ''}`,
        amount,
        reference_type: 'SALE',
        reference_id: sale.id,
        derived: true,
      });
    }

    for (const production of productions) {
      const amount = amountValue(production.revenue);
      const id = textValue(production.id);
      if (amount <= 0 || !id || !isPending('production_records', id) || incomeReferences.has(`PRODUCTION:${id}`)) continue;
      const type = textValue(production.production_type);
      derivedIncomes.push({
        id: `derived:PRODUCTION:${id}`,
        farm_id: scope.farmId,
        record_date: production.production_date,
        transaction_type: 'INCOME',
        category: 'Producción',
        description: type ? `Producción - ${type}` : 'Producción',
        amount,
        reference_type: 'PRODUCTION',
        reference_id: production.id,
        derived: true,
      });
    }

    return { expenses: derivedExpenses, incomes: derivedIncomes };
  }, [scope?.userId, scope?.farmId]);

  return derived ?? EMPTY;
}
