import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Lease = { id: string; unitId: string; tenantId: string; startDate: string; endDate: string; rentAmount: number };

type ListResponse<T> = { items: T[] };

export default function LeasesPage() {
  const [items, setItems] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ListResponse<Lease>>('/leases');
        setItems(data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Leases</h2>
      <ul>
        {items.map((l) => (
          <li key={l.id}>Unit {l.unitId} — Tenant {l.tenantId} — ${'{'}l.rentAmount{'}'}/mo</li>
        ))}
      </ul>
    </div>
  );
}
