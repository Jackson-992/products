import './Sales.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const SalesTab = () => {
    // Mock data - replace with actual API data
    const salesData = [
        { month: 'Jan', sales: 4000, products: 240 },
        { month: 'Feb', sales: 3000, products: 198 },
        { month: 'Mar', sales: 5000, products: 320 },
        { month: 'Apr', sales: 2780, products: 189 },
        { month: 'May', sales: 3890, products: 276 },
        { month: 'Jun', sales: 4390, products: 312 }
    ]

    const topProducts = [
        { name: 'Product A', sales: 1200 },
        { name: 'Product B', sales: 980 },
        { name: 'Product C', sales: 760 },
        { name: 'Product D', sales: 540 },
        { name: 'Product E', sales: 320 }
    ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    const stats = {
        totalIncome: '$23,450',
        totalProducts: '1,335',
        averageOrder: '$175.60',
        growth: '+12.5%'
    }

    return (
        <div className="sales-tab">
            <h2>Sales Analytics</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Income</h3>
                    <div className="stat-value">{stats.totalIncome}</div>
                    <div className="stat-growth positive">{stats.growth}</div>
                </div>

                <div className="stat-card">
                    <h3>Products Sold</h3>
                    <div className="stat-value">{stats.totalProducts}</div>
                    <div className="stat-growth positive">+8.2%</div>
                </div>

                <div className="stat-card">
                    <h3>Average Order</h3>
                    <div className="stat-value">{stats.averageOrder}</div>
                    <div className="stat-growth positive">+3.1%</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Monthly Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#007bff" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Top Performing Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="sales"
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Products Table */}
            <div className="products-table">
                <h3>Top Performing Products</h3>
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Growth</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topProducts.map((product, index) => (
                            <tr key={index}>
                                <td>{product.name}</td>
                                <td>{product.sales}</td>
                                <td>${(product.sales * 45.99).toLocaleString()}</td>
                                <td className="positive">+{(Math.random() * 20 + 5).toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SalesTab