import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Package, DollarSign, Users, ShoppingCart, Box } from 'lucide-react';
import { Product } from '@/hooks/product-data.ts';
import './AnalyticsTab.css';

interface AnalyticsTabProps {
    products?: Product[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ products = [] }) => {
    // Sample data - replace with your actual data
    const salesData = [
        { month: 'Jan', sales: 4000, revenue: 2400 },
        { month: 'Feb', sales: 3000, revenue: 1398 },
        { month: 'Mar', sales: 2000, revenue: 9800 },
        { month: 'Apr', sales: 2780, revenue: 3908 },
        { month: 'May', sales: 1890, revenue: 4800 },
        { month: 'Jun', sales: 2390, revenue: 3800 },
        { month: 'Jul', sales: 3490, revenue: 4300 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 35 },
        { name: 'Fashion', value: 25 },
        { name: 'Home & Kitchen', value: 20 },
        { name: 'Health & Fitness', value: 15 },
        { name: 'Other', value: 5 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // Calculate analytics from products
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stockCount), 0);
    const lowStockProducts = products.filter(product => product.stockCount < 10).length;
    const outOfStockProducts = products.filter(product => product.stockCount === 0).length;
    const activeProducts = products.filter(product => product.status === 'active').length;

    const topSellingProducts = [...products]
        .sort((a, b) => (b.stockCount - a.stockCount)) // Using stock count as a proxy for sales
        .slice(0, 5);

    return (
        <div className="analytics-tab">
            <div className="analytics-grid">
                {/* Summary Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ksh {totalValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +8.2% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            {outOfStockProducts} out of stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            +18% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="charts-grid">
                {/* Sales Trend Chart */}
                <Card className="chart-card">
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Monthly sales and revenue performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="chart-card">
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Products by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Selling Products */}
            <Card className="top-products-card">
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Most popular items by stock movement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="top-products-list">
                        {topSellingProducts.map((product, index) => (
                            <div key={product.id} className="top-product-item">
                                <div className="product-rank">{index + 1}</div>
                                {product.images.length > 0 && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="product-thumbnail"
                                    />
                                )}
                                <div className="product-info">
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-category">{product.category}</div>
                                </div>
                                <div className="product-stats">
                                    <div className="stock-count">{product.stockCount} in stock</div>
                                    <div className="product-price">Ksh {product.price.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsTab;