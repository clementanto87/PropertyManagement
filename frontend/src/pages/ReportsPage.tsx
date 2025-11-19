import { useState } from 'react';
import { BarChart3, PieChart, LineChart, Download, Filter, Building2, DollarSign, Users, Home, User, Bell, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportsPage = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [reportType, setReportType] = useState('financial');
  const [propertyFilter, setPropertyFilter] = useState('all');

  const renderReportContent = () => {
    switch (reportType) {
      case 'financial':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">$24,780</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+12%</span>
                  <span className="text-xs text-gray-400 ml-2">from last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">$8,450</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">+5%</span>
                  <span className="text-xs text-gray-400 ml-2">from last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">$16,330</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+15%</span>
                  <span className="text-xs text-gray-400 ml-2">from last month</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Income vs Expenses</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <LineChart className="w-16 h-16 opacity-20 mb-4" />
                <span className="text-sm font-medium">Chart visualization would render here</span>
                <span className="text-xs mt-1">Using chart.js or recharts</span>
              </div>
            </div>
          </div>
        );

      case 'occupancy':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+2</span>
                  <span className="text-xs text-gray-400 ml-2">new this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Occupied Units</h3>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Home className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">18</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">75%</span>
                  <span className="text-xs text-gray-400 ml-2">occupancy rate</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Vacant Units</h3>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Home className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">6</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">25%</span>
                  <span className="text-xs text-gray-400 ml-2">vacancy rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Property Occupancy</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-16 h-16 opacity-20 mb-4" />
                <span className="text-sm font-medium">Occupancy chart visualization</span>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">2 Urgent</span>
                  <span className="text-xs text-gray-400 ml-2">needs attention</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Active</span>
                  <span className="text-xs text-gray-400 ml-2">being worked on</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">This Month</span>
                  <span className="text-xs text-gray-400 ml-2">successfully closed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Maintenance Requests</h3>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Leaking Faucet Repair</p>
                          <p className="text-sm text-gray-500">Property #{item} • Bathroom</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${(item * 120).toFixed(2)}</p>
                        <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${item === 1
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : item === 2
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                          {item === 1 ? 'In Progress' : item === 2 ? 'Pending' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Status Distribution</h3>
                <div className="h-64 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <PieChart className="w-12 h-12 opacity-20 mb-4" />
                  <span className="text-sm font-medium">Pie chart visualization</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500">Track performance and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setReportType('financial')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'financial'
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Financial
              </button>
              <button
                onClick={() => setReportType('occupancy')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'occupancy'
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                Occupancy
              </button>
              <button
                onClick={() => setReportType('maintenance')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'maintenance'
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                Maintenance
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="1">Downtown Apartments</SelectItem>
                  <SelectItem value="2">Riverside Condos</SelectItem>
                  <SelectItem value="3">Hillside Villas</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[240px] justify-start text-left font-normal bg-white',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y')} -{' '}
                          {format(date.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsPage;
