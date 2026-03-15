"use client";

import { useEffect, useState } from "react";
import {
  useDashboardStats,
  useRevenueChart,
  useStorePerformance,
} from "../Overview/_hooks/useOverview";
import { getUser } from "@/services/session.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { User } from "@/types";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.FC<{ className?: string }>;
}> = ({ title, value, change, icon: Icon }) => (
  <Card className="hover:border-primary/30 transition-colors">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickLink: React.FC<{
  href: string;
  label: string;
  description: string;
}> = ({ href, label, description }) => (
  <Link
    href={href}
    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
  >
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
  </Link>
);

export default function OverviewPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart();
  const { data: storeData } = useStorePerformance();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
          <span>Welcome back, {user?.name}.</span>
          <Badge variant="outline" className="text-xs">
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Stores"
              value={stats.totalStores}
              icon={Store}
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              change={stats.ordersChange}
              icon={ShoppingCart}
            />
            <StatCard
              title="Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change={stats.revenueChange}
              icon={DollarSign}
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {revenueData && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.3)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Store Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {storeData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {user?.role === UserRole.SUPER_ADMIN && (
            <QuickLink
              href="/Dashboard/Stores"
              label="Manage Stores"
              description="View and create stores"
            />
          )}
          <QuickLink
            href="/Dashboard/Products"
            label="Products"
            description="View and manage inventory"
          />
          <QuickLink
            href="/Dashboard/Sell"
            label="New Sale"
            description="Process a new sale"
          />
          <QuickLink
            href="/Dashboard/Transactions"
            label="Transactions"
            description="View recent activity"
          />
        </CardContent>
      </Card>
    </div>
  );
}


