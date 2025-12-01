import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

type Unit = { id: string; propertyId: string; unitNumber: string; bedrooms: number; bathrooms: number };

type ListResponse<T> = { items: T[] };

export default function UnitsPage() {
  const [items, setItems] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ListResponse<Unit>>('/units');
        setItems(data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Units</h2>
      <ul>
        {items.map((u) => (
          <li key={u.id}>
            <Link to={`/dashboard/units/${u.id}`} className="text-blue-600 hover:underline">
              {u.unitNumber} — {u.bedrooms}bd/{u.bathrooms}ba
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
