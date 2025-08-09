import React, { useState } from 'react';
import { Package, DollarSign, TrendingUp, Users, Share2, CreditCard, ArrowUpDown, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('paypal');
    const [transactions] = useState([
        { id: '1', type: 'commission', amount: 42.50, date: '2023-06-15', status: 'completed' },
        { id: '2', type: 'withdrawal', amount: -200.00, date: '2023-06-10', status: 'completed' },
        { id: '3', type: 'commission', amount: 35.75, date: '2023-06-05', status: 'completed' },
        { id: '4', type: 'commission', amount: 28.90, date: '2023-05-28', status: 'completed' },
    ]);

    const sellerStats = {
        balance: 18450.32,
        pendingBalance: 3420.50,
        totalClicks: 1247,
        totalSales: 89,
        conversionRate: 7.1,
    };

    const [affiliateLinks] = useState([
        {
            id: '1',
            productName: 'Wireless Bluetooth Headphones',
            productId: 'prod_001',
            price: 799.99,
            commissionRate: 10,
            clicks: 245,
            conversions: 18,
            link: 'https://example.com/?ref=seller123&prod=prod_001',
        },
        {
            id: '2',
            productName: 'Smart Coffee Maker',
            productId: 'prod_002',
            price: 1499.99,
            commissionRate: 8,
            clicks: 187,
            conversions: 12,
            link: 'https://example.com/?ref=seller123&prod=prod_002',
        },
        {
            id: '3',
            productName: 'Gaming Mechanical Keyboard',
            productId: 'prod_003',
            price: 1290,
            commissionRate: 12,
            clicks: 315,
            conversions: 24,
            link: 'https://example.com/?ref=seller123&prod=prod_003',
        },
    ]);

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(withdrawAmount) > sellerStats.balance) {
            alert('Withdrawal amount exceeds available balance');
            return;
        }
        alert(`Withdrawal request of $${withdrawAmount} to ${withdrawMethod} submitted!`);
        setWithdrawOpen(false);
        setWithdrawAmount('');
    };

    return (
        <div className="seller-dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Affiliate Dashboard</h1>
                        <p className="dashboard-subtitle">Earn commissions by promoting our products</p>
                    </div>
                    <div className="account-balance">
                        <div className="balance-amount">Ksh {sellerStats.balance.toLocaleString()}</div>
                        <div className="balance-label">Available Balance</div>
                        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                            <DialogTrigger asChild>
                                <Button className="withdraw-btn">
                                    <ArrowUpDown className="btn-icon" />
                                    Withdraw
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="withdraw-dialog">
                                <DialogHeader>
                                    <DialogTitle>Withdraw Funds</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleWithdraw} className="withdraw-form">
                                    <div className="form-group">
                                        <Label htmlFor="amount">Amount ($)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="10"
                                            max={sellerStats.balance}
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder={`Max Ksh ${sellerStats.balance}`}
                                            required
                                        />
                                        <div className="available-balance">
                                            Available: Ksh {sellerStats.balance.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="method">Withdrawal Method</Label>
                                        <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="withdraw-actions">
                                        <Button type="button" variant="outline" onClick={() => setWithdrawOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Request Withdrawal</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="dashboard-tabs">
                    <TabsList className="tabs-list">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="tab-content">
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <Card className="stats-card">
                                <CardHeader className="card-header">
                                    <CardTitle className="card-title">Available Balance</CardTitle>
                                    <DollarSign className="card-icon" />
                                </CardHeader>
                                <CardContent className="card-content">
                                    <div className="card-value">KSh {sellerStats.balance.toLocaleString()}</div>
                                    <p className="card-description">Ready to withdraw</p>
                                </CardContent>
                            </Card>

                            <Card className="stats-card">
                                <CardHeader className="card-header">
                                    <CardTitle className="card-title">Pending Balance</CardTitle>
                                    <CreditCard className="card-icon" />
                                </CardHeader>
                                <CardContent>
                                    <div className="card-value">KSh {sellerStats.pendingBalance.toLocaleString()}</div>
                                    <p className="card-description">Clearing in 7 days</p>
                                </CardContent>
                            </Card>

                            <Card className="stats-card">
                                <CardHeader className="card-header">
                                    <CardTitle className="card-title">Total Clicks</CardTitle>
                                    <TrendingUp className="card-icon" />
                                </CardHeader>
                                <CardContent>
                                    <div className="card-value">{sellerStats.totalClicks}</div>
                                    <p className="card-description">On your links</p>
                                </CardContent>
                            </Card>

                            <Card className="stats-card">
                                <CardHeader className="card-header">
                                    <CardTitle className="card-title">Conversion Rate</CardTitle>
                                    <Users className="card-icon" />
                                </CardHeader>
                                <CardContent>
                                    <div className="card-value">{sellerStats.conversionRate}%</div>
                                    <p className="card-description">Clicks to purchases</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Chart Placeholder */}
                        <Card className="performance-card">
                            <CardHeader>
                                <CardTitle>30-Day Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="chart-placeholder">
                                    <TrendingUp className="chart-icon" />
                                    <p>Your performance chart will appear here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="tab-content">
                        {/* Available Products */}
                        <Card className="products-card">
                            <CardHeader>
                                <CardTitle>Promote These Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="products-grid">
                                    {affiliateLinks.map((product) => (
                                        <div key={product.id} className="product-card">
                                            <div className="product-content">
                                                <h3 className="product-name">{product.productName}</h3>
                                                <div className="product-price">Ksh {product.price}</div>
                                                <div className="product-meta">
                                                    <span className="commission-rate">
                                                        {product.commissionRate}% commission
                                                    </span>
                                                    <span className="conversion-rate">
                                                        {(product.conversions / product.clicks * 100).toFixed(1)}% conversion
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="product-actions">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(product.link)}
                                                    className="copy-btn"
                                                >
                                                    <Share2 className="action-icon" />
                                                    Copy Link
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="tab-content">
                        {/* Transactions History */}
                        <Card className="transactions-card">
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="transactions-list">
                                    {transactions.map((txn) => (
                                        <div key={txn.id} className={`transaction-item ${txn.type}`}>
                                            <div className="transaction-icon">
                                                {txn.type === 'commission' ? (
                                                    <DollarSign className="icon" />
                                                ) : (
                                                    <CreditCard className="icon" />
                                                )}
                                            </div>
                                            <div className="transaction-details">
                                                <div className="transaction-type">
                                                    {txn.type === 'commission' ? 'Commission Earned' : 'Withdrawal'}
                                                </div>
                                                <div className="transaction-date">{txn.date}</div>
                                            </div>
                                            <div className={`transaction-amount ${txn.type}`}>
                                                {txn.amount > 0 ? '+' : ''}{txn.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SellerDashboard;