import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Bell,
  Plus,
  Wallet,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { expenseService, Expense } from '@/api/expenseService';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getExpenses();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      toast.error(t('expenses.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.property?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.note || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenses = filteredItems.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('expenses.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center border border-border">
                  <Wallet className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('expenses.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('expenses.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Button
                onClick={() => navigate('/dashboard/expenses/new')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('expenses.logExpense')}
              </Button>
            </div>
          </div>

          {/* Search and Stats Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm text-foreground"
                placeholder={t('expenses.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2 shadow-sm">
              <div className="text-sm text-muted-foreground">{t('expenses.totalExpenses')}</div>
              <div className="text-lg font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('expenses.showing')} <span className="font-semibold text-foreground">{filteredItems.length}</span> {t('expenses.records')}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('expenses.noExpenses')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? t('expenses.noExpensesDescSearch') : t('expenses.noExpensesDescEmpty')}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard/expenses/new')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t('expenses.logFirstExpense')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('expenses.table.date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('expenses.table.category')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('expenses.table.property')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('expenses.table.description')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('expenses.table.amount')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('expenses.table.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredItems.map((expense) => (
                    <tr
                      key={expense.id}
                      onClick={() => navigate(`/dashboard/expenses/${expense.id}/edit`)}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(expense.incurredAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-foreground">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {expense.property?.title || t('expenses.table.unknownProperty')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {expense.note || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-foreground">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:text-foreground inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
