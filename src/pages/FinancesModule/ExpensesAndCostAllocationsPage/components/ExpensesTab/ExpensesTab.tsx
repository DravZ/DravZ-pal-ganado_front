import React, { useState } from 'react';
import styles from './ExpensesTab.module.css';
import { Search } from 'lucide-react';
import type { Expense } from '../../../../../types/database.types';

type ExpenseUI = Expense & {
  supplier_name: string;
  assignment_text: string;
  formatted_amount: string;
};

const MOCK_EXPENSES: ExpenseUI[] = [
  {
    id: 'exp-1',
    farm_id: 'farm-1',
    supplier_id: 'sup-1',
    supplier_name: 'Veterinaria San Martín',
    expense_date: '14 jun 2025',
    category: 'Sanidad',
    description: 'Compra vacuna clostridial',
    amount: 1062075,
    status: 'Asignado',
    assignment_text: 'Vacas de cría',
    formatted_amount: '$1,062,075'
  },
  {
    id: 'exp-2',
    farm_id: 'farm-1',
    supplier_id: 'sup-2',
    supplier_name: 'Servicios Rurales SAS',
    expense_date: '10 jun 2025',
    category: 'Infraestructura',
    description: 'Mantenimiento de cercas',
    amount: 840000,
    status: 'Asignado',
    assignment_text: 'Potrero Norte',
    formatted_amount: '$840,000'
  },
  {
    id: 'exp-3',
    farm_id: 'farm-1',
    supplier_id: 'sup-3',
    supplier_name: 'Dra. Ana Costa',
    expense_date: '08 jun 2025',
    category: 'Servicios',
    description: 'Honorarios veterinarios',
    amount: 650000,
    status: 'Pendiente',
    assignment_text: 'Sin asignar',
    formatted_amount: '$650,000'
  }
];

export const ExpensesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.cardBox}>
      {/* CABECERA CON BÚSQUEDA */}
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>EXPENSES</span>
          <h2 className={styles.cardTitle}>Movimientos recientes</h2>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar gasto..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>DESCRIPCIÓN / PROVEEDOR</th>
              <th>FECHA</th>
              <th>CATEGORÍA</th>
              <th>ASIGNACIÓN</th>
              <th>MONTO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EXPENSES.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="fw-bold">{item.description}</div>
                  <div className={styles.subText}>{item.supplier_name}</div>
                </td>
                <td>{item.expense_date}</td>
                <td>
                  <span className={styles.categoryBadge}>{item.category}</span>
                </td>
                <td>{item.assignment_text}</td>
                <td className="fw-bold">{item.formatted_amount}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      item.status === 'Asignado'
                        ? styles.badgeAssigned
                        : styles.badgePending
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesTab;