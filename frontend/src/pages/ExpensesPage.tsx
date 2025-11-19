import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Expense = { id: string; propertyId: string; amount: number; category: string; incurredAt: string };

type ListResponse<T> = { items: T[] };

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ListResponse<Expense>>('/expenses');
        setItems(data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Expenses</h2>
      <ul>
        {items.map((e) => (
          <li key={e.id}>${'{'}e.amount{'}'} — {e.category} — {new Date(e.incurredAt).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
}
