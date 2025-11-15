import './AffilliatesTable.css';
import { useState } from 'react';
import AffiliateDetails from './AffiliateDetails';
import { useAffiliates } from '@/hooks/useAffiliates.ts';

const AffiliatesTable = () => {
    const { affiliates, loading } = useAffiliates();
    const [selectedAffiliate, setSelectedAffiliate] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleAffiliateClick = (affiliate) => {
        setSelectedAffiliate(affiliate);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedAffiliate(null);
    };

    // Filter and sort affiliates
    const filteredAndSortedAffiliates = affiliates
        .filter(affiliate =>
            (affiliate.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (affiliate.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (affiliate.affiliate_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';

            if (sortBy === 'created_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'Ksh 0';
        return `Ksh ${Number(amount).toLocaleString()}`;
    };

    if (loading) {
        return <div className="loading">Loading affiliates...</div>;
    }

    return (
        <div className="affiliates-table-container">
            <div className="table-header">
                <div className="header-left">
                    <h2>Affiliate Partners</h2>
                    <span className="affiliate-count">
                        {filteredAndSortedAffiliates.length} of {affiliates.length} affiliates
                    </span>
                </div>

                <div className="header-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by name, user ID, or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Affiliates Table */}
            <div className="table-wrapper">
                <table className="affiliates-table">
                    <thead>
                    <tr>
                        <th
                            className="sortable"
                            onClick={() => handleSort('affiliate_code')}
                        >
                            Code {getSortIcon('affiliate_code')}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('user_name')}
                        >
                            Name {getSortIcon('user_name')}
                        </th>
                        <th>User ID</th>
                        <th
                            className="sortable hide-on-mobile"
                            onClick={() => handleSort('created_at')}
                        >
                            Joined {getSortIcon('created_at')}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('total_referrals')}
                        >
                            Referrals {getSortIcon('total_referrals')}
                        </th>
                        <th
                            className="sortable hide-on-small"
                            onClick={() => handleSort('total_earned')}
                        >
                            Earned {getSortIcon('total_earned')}
                        </th>
                        <th
                            className="sortable hide-on-small"
                            onClick={() => handleSort('balance')}
                        >
                            Balance {getSortIcon('balance')}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedAffiliates.length > 0 ? (
                        filteredAndSortedAffiliates.map((affiliate) => (
                            <tr
                                key={affiliate.id}
                                className="affiliate-row"
                                onClick={() => handleAffiliateClick(affiliate)}
                            >
                                <td className="affiliate-code">
                                    <span className="code-badge">{affiliate.affiliate_code || 'N/A'}</span>
                                </td>
                                <td className="user-name">{affiliate.user_name || 'Unknown User'}</td>
                                <td className="user-id">{affiliate.user_id || 'N/A'}</td>
                                <td className="join-date hide-on-mobile">
                                    {formatDate(affiliate.created_at)}
                                </td>
                                <td className="referrals-count">
                                    {affiliate.total_referrals || 0}
                                </td>
                                <td className="total-earned hide-on-small">
                                    {formatCurrency(affiliate.total_earned)}
                                </td>
                                <td className="balance hide-on-small">
                                    {formatCurrency(affiliate.balance)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-results">
                                {searchTerm ? 'No affiliates match your search' : 'No affiliates found'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <AffiliateDetails
                affiliate={selectedAffiliate}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />
        </div>
    );
};

export default AffiliatesTable;