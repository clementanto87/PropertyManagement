import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Vendor = { id: string; name: string; insured: boolean };

type ListResponse<T> = { items: T[] };

export default function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ListResponse<Vendor>>('/vendors');
        setItems(data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Vendors</h2>
      <ul>
        {items.map((v) => (
          <li key={v.id}>{v.name} {v.insured ? '✅' : '❌'}</li>
        ))}
      </ul>
    </div>
  );
}
