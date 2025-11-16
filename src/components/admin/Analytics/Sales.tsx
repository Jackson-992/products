import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

// Mock service - replace with your actual service import
import { salesAnalyticsService } from '@/services/AdminServices/analytics/adminSalesAnalytics.ts';
const SalesAnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalProductsSold: 0,
        totalOrders: 0,
        averageOrderValue: 0
    });

    const [topProducts, setTopProducts] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [income, products, orders, avgOrder, topProds, monthly, categories] = await Promise.all([
                salesAnalyticsService.getTotalIncome(),
                salesAnalyticsService.getTotalProductsSold(),
                salesAnalyticsService.getTotalOrders(),
                salesAnalyticsService.getAverageOrderValue(),
                salesAnalyticsService.getTopProducts(5),
                salesAnalyticsService.getMonthlySalesTrend(12),
                salesAnalyticsService.getSalesByCategory()
            ]);

            setStats({
                totalIncome: income.success ? income.total : 0,
                totalProductsSold: products.success ? products.total : 0,
                totalOrders: orders.success ? orders.total : 0,
                averageOrderValue: avgOrder.success ? avgOrder.average : 0
            });

            setTopProducts(topProds.success ? topProds.products : []);
            setMonthlySales(monthly.success ? monthly.trend : []);
            setCategoryData(categories.success ? categories.categories : []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'Ksh'
        }).format(value);
    };

    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                    <p className="text-gray-600 mt-2">Overview of your store's performance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(stats.totalIncome)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats.totalOrders.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <ShoppingCart className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats.totalProductsSold.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(stats.averageOrderValue)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Sales Trend */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Sales Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlySales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={formatMonth}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'revenue' ? formatCurrency(value) : value,
                                        name === 'revenue' ? 'Revenue' : 'Orders'
                                    ]}
                                    labelFormatter={formatMonth}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Revenue"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Orders"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Products</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="product_name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    // label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        formatCurrency(value),
                                        name === 'total_revenue' ? 'Revenue' : name
                                    ]}
                                />
                                <Legend />
                                <Bar dataKey="total_revenue" fill="#8b5cf6" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales by Category */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="revenue"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => entry.category}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Quantities */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products by Quantity</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="product_name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="total_quantity" fill="#ec4899" name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalyticsDashboard;