#!/bin/bash
# Proper sed replacements for ReportsPage.tsx

# Add useTranslation import
sed -i '' '2i\
import { useTranslation } from '\''react-i18next'\'';
' "$1"

# Add useTranslation hook after component declaration
sed -i '' '/const ReportsPage = () => {/a\
  const { t } = useTranslation();
' "$1"

# Fix error message
sed -i '' "s/toast.error('Failed to load report data');/toast.error(t('reports.errors.loadFailed'));/" "$1"

# Fix loading text
sed -i '' "s/>Loading Reports</>/{t('reports.loading')}</g" "$1"

# Fix header and main UI
sed -i '' "s/>Reports & Analytics</>/{t('reports.title')}</g" "$1"
sed -i '' "s/>Track performance and insights</>/{t('reports.subtitle')}</g" "$1"
sed -i '' "s/>Export Report</>/{t('reports.exportReport')}</g" "$1"

# Fix tabs
sed -i '' "s/>Financial</>/{t('reports.tabs.financial')}</g" "$1"
sed -i '' "s/>Occupancy</>/{t('reports.tabs.occupancy')}</g" "$1"
sed -i '' "s/>Maintenance</>/{t('reports.tabs.maintenance')}</g" "$1"

# Fix property filter
sed -i '' "s/>All Properties</>/{t('reports.allProperties')}</g" "$1"
sed -i '' "s/>Pick a date</>/{t('reports.pickDate')}</g" "$1"

# Fix financial metrics
sed -i '' "s/>Projected Income</>/{t('reports.financial.projectedIncome')}</g" "$1"
sed -i '' "s/>Monthly Projection</>/{t('reports.financial.monthlyProjection')}</g" "$1"
sed -i '' "s/>Total Expenses</>/{t('reports.financial.totalExpenses')}</g" "$1"
sed -i '' "s/>All Time</>/{t('reports.financial.allTime')}</g" "$1"
sed -i '' "s/>Net Profit</>/{t('reports.financial.netProfit')}</g" "$1"
sed -i '' "s/>Estimate</>/{t('reports.financial.estimate')}</g" "$1"
sed -i '' "s/>Income vs Expenses</>/{t('reports.financial.incomeVsExpenses')}</g" "$1"
sed -i '' "s/>Chart visualization coming soon (requires historical data)</>/{t('reports.financial.chartComingSoon')}</g" "$1"

# Fix occupancy metrics
sed -i '' "s/>Total Properties</>/{t('reports.occupancy.totalProperties')}</g" "$1"
sed -i '' "s/>Occupied Units</>/{t('reports.occupancy.occupiedUnits')}</g" "$1"
sed -i '' "s/>occupancy rate</>/{t('reports.occupancy.occupancyRate')}</g" "$1"
sed -i '' "s/>Vacant Units</>/{t('reports.occupancy.vacantUnits')}</g" "$1"
sed -i '' "s/>vacancy rate</>/{t('reports.occupancy.vacancyRate')}</g" "$1"
sed -i '' "s/>Occupancy Status</>/{t('reports.occupancy.occupancyStatus')}</g" "$1"

# Fix maintenance metrics
sed -i '' "s/>Pending Requests</>/{t('reports.maintenance.pendingRequests')}</g" "$1"
sed -i '' "s/>In Progress</>/{t('reports.maintenance.inProgress')}</g" "$1"
sed -i '' "s/>Completed</>/{t('reports.maintenance.completed')}</g" "$1"
sed -i '' "s/>Recent Maintenance Requests</>/{t('reports.maintenance.recentRequests')}</g" "$1"
sed -i '' "s/>Status Distribution</>/{t('reports.maintenance.statusDistribution')}</g" "$1"
sed -i '' "s/'Unknown Property'/t('reports.maintenance.unknownProperty')/g" "$1"
sed -i '' "s/>No work orders found.</>/{t('reports.maintenance.noWorkOrders')}</g" "$1"

# Fix chart labels
sed -i '' "s/labels: \['Occupied', 'Vacant'\]/labels: [t('reports.occupancy.occupied'), t('reports.occupancy.vacant')]/" "$1"
sed -i '' "s/labels: \['Pending', 'In Progress', 'Completed'\]/labels: [t('reports.maintenance.pending'), t('reports.maintenance.inProgress'), t('reports.maintenance.completed')]/" "$1"
sed -i '' "s/label: 'Work Orders'/label: t('reports.maintenance.workOrders')/" "$1"

echo "Replacements complete!"
