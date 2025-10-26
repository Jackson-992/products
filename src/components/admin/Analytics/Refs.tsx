import './Refs.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ReferralsTab = () => {
    const referralStats = {
        totalAffiliates: '245',
        totalPaidIn: '$12,450',
        totalPaidOut: '$8,230',
        netProfit: '$4,220',
        profitMargin: '33.9%'
    }

    const topReferees = [
        { name: 'John Smith', referrals: 45, converted: 32, revenue: '$4,560' },
        { name: 'Sarah Johnson', referrals: 38, converted: 28, revenue: '$3,890' },
        { name: 'Mike Chen', referrals: 32, converted: 24, revenue: '$3,210' },
        { name: 'Emily Davis', referrals: 28, converted: 21, revenue: '$2,980' },
        { name: 'Alex Rodriguez', referrals: 25, converted: 19, revenue: '$2,670' }
    ]

    const referralTrend = [
        { month: 'Jan', signups: 15, revenue: 1200 },
        { month: 'Feb', signups: 22, revenue: 1800 },
        { month: 'Mar', signups: 18, revenue: 1500 },
        { month: 'Apr', signups: 35, revenue: 2800 },
        { month: 'May', signups: 28, revenue: 2200 },
        { month: 'Jun', signups: 42, revenue: 3400 }
    ]

    return (
        <div className="referrals-tab">
            <h2>Referral Program Analytics</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Affiliates</h3>
                    <div className="stat-value">{referralStats.totalAffiliates}</div>
                    <div className="stat-growth positive">+15.2%</div>
                </div>

                <div className="stat-card">
                    <h3>Total Paid In</h3>
                    <div className="stat-value">{referralStats.totalPaidIn}</div>
                    <div className="stat-growth positive">+22.8%</div>
                </div>

                <div className="stat-card">
                    <h3>Total Paid Out</h3>
                    <div className="stat-value">{referralStats.totalPaidOut}</div>
                    <div className="stat-growth positive">+18.5%</div>
                </div>

                <div className="stat-card">
                    <h3>Net Profit</h3>
                    <div className="stat-value">{referralStats.netProfit}</div>
                    <div className="stat-growth positive">{referralStats.profitMargin}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="chart-section">
                <div className="chart-container">
                    <h3>Referral Program Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={referralTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="signups" fill="#8884d8" name="New Signups" />
                            <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Referees Table */}
            <div className="referees-table">
                <h3>Top Performing Referees</h3>
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Referee</th>
                            <th>Referrals</th>
                            <th>Converted</th>
                            <th>Conversion Rate</th>
                            <th>Revenue</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topReferees.map((referee, index) => (
                            <tr key={index}>
                                <td>{referee.name}</td>
                                <td>{referee.referrals}</td>
                                <td>{referee.converted}</td>
                                <td>{((referee.converted / referee.referrals) * 100).toFixed(1)}%</td>
                                <td>{referee.revenue}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ReferralsTab