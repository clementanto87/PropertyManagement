import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, PenTool, FileText, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tenant } from '../services/api';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await tenant.getDashboard();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {data?.tenantName}. Here's what's happening with your home.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/app/maintenance/new">Request Repair</Link>
          </Button>
          <Button asChild>
            <Link to="/app/payments">Pay Rent</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none shadow-lg shadow-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium opacity-90 text-blue-100">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${data?.balance?.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1 text-blue-100">Due {data?.nextDueDate}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lease Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="text-2xl font-bold">{data?.leaseStatus}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ends {new Date(data?.leaseEndDate).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div className="text-2xl font-bold">{data?.openRequests}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Maintenance pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div className="text-2xl font-bold">{data?.nextInspection || 'None'}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest payments and requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data?.recentActivity.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${item.type === 'payment' ? 'bg-green-100 text-green-600' :
                      item.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {item.type === 'payment' && <CreditCard className="h-4 w-4" />}
                      {item.type === 'maintenance' && <PenTool className="h-4 w-4" />}
                      {item.type === 'document' && <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.amount && (
                      <p className={`font-medium text-sm ${item.amount < 0 ? 'text-gray-900' : 'text-green-600'}`}>
                        {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toLocaleString()}
                      </p>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might need to do.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="h-auto py-4 justify-start px-4 hover:bg-blue-50 hover:border-blue-200 transition-all group" asChild>
              <Link to="/app/payments">
                <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold group-hover:text-blue-700 transition-colors">Pay Rent</div>
                  <div className="text-xs text-muted-foreground">Secure online payment</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start px-4 hover:bg-orange-50 hover:border-orange-200 transition-all group" asChild>
              <Link to="/app/maintenance">
                <div className="bg-orange-100 p-2 rounded-full mr-4 group-hover:bg-orange-200 transition-colors">
                  <PenTool className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold group-hover:text-orange-700 transition-colors">Report Issue</div>
                  <div className="text-xs text-muted-foreground">Request maintenance</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start px-4 hover:bg-purple-50 hover:border-purple-200 transition-all group" asChild>
              <Link to="/app/documents">
                <div className="bg-purple-100 p-2 rounded-full mr-4 group-hover:bg-purple-200 transition-colors">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold group-hover:text-purple-700 transition-colors">View Lease</div>
                  <div className="text-xs text-muted-foreground">Access your documents</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
