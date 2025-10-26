import './Affs.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const AffiliateSalesTab = () => {
    const affiliateStats = {
        topAffiliate: 'Emma Wilson',
        topAffiliateSales: '$8,450',
        totalCommission: '$15,670',
        activeAffiliates: '189',
        conversionRate: '4.2%'
    }

    const topAffiliates = [
        { name: 'Emma Wilson', sales: 45, commission: 8450, rate: '15%' },
        { name: 'James Brown', sales: 38, commission: 7120, rate: '15%' },
        { name: 'Lisa Taylor', sales: 32, commission: 5980, rate: '15%' },
        { name: 'Robert Lee', sales: 28, commission: 5230, rate: '15%' },
        { name: 'Maria Garcia', sales: 25, commission: 4670, rate: '15%' }
    ]

    const topProducts = [
        { name: 'Wireless Earbuds', sales: 89, revenue: 5340 },
        { name: 'Smart Watch', sales: 76, revenue: 9880 },
        { name: 'Laptop Stand', sales: 65, revenue: 1950 },
        { name: 'Phone Case', sales: 54, revenue: 1080 },
        { name: 'Tablet Holder', sales: 43, revenue: 1290 }
    ]

    const commissionData = [
        { month: 'Jan', commission: 1200 },
        { month: 'Feb', commission: 1800 },
        { month: 'Mar', commission: 1500 },
        { month: 'Apr', commission: 2200 },
        { month: 'May', commission: 2800 },
        { month: 'Jun', commission: 3400 }
    ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    return (
        <div className="affiliate-sales-tab">
            <h2>Affiliate Sales Analytics</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Top Affiliate</h3>
                    <div className="stat-value">{affiliateStats.topAffiliate}</div>
                    <div className="stat-desc">Sales: {affiliateStats.topAffiliateSales}</div>
                </div>

                <div className="stat-card">
                    <h3>Total Commission</h3>
                    <div className="stat-value">{affiliateStats.totalCommission}</div>
                    <div className="stat-growth positive">+25.3%</div>
                </div>

                <div className="stat-card">
                    <h3>Active Affiliates</h3>
                    <div className="stat-value">{affiliateStats.activeAffiliates}</div>
                    <div className="stat-growth positive">+12.8%</div>
                </div>

                <div className="stat-card">
                    <h3>Conversion Rate</h3>
                    <div className="stat-value">{affiliateStats.conversionRate}</div>
                    <div className="stat-growth positive">+2.1%</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Commission Payout Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={commissionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="commission" fill="#ff6b6b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Top Products by Affiliates</h3>
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

            {/* Tables */}
            <div className="tables-grid">
                <div className="table-section">
                    <h3>Top Performing Affiliates</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                            <tr>
                                <th>Affiliate</th>
                                <th>Sales</th>
                                <th>Commission</th>
                                <th>Rate</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topAffiliates.map((affiliate, index) => (
                                <tr key={index}>
                                    <td>{affiliate.name}</td>
                                    <td>{affiliate.sales}</td>
                                    <td>${affiliate.commission.toLocaleString()}</td>
                                    <td>{affiliate.rate}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="table-section">
                    <h3>Top Products Sold by Affiliates</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                            <tr>
                                <th>Product</th>
                                <th>Sales</th>
                                <th>Revenue</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topProducts.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.name}</td>
                                    <td>{product.sales}</td>
                                    <td>${product.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AffiliateSalesTab