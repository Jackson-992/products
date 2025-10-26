import './UsersTable.css';
import { useState, useMemo } from 'react';

const UsersTable = () => {
    // Mock data - replace with actual API call
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'John Doe',
            user_id: 'USR001',
            phone: '+1-555-0101',
            email: 'john@example.com',
            date_created: '2024-01-15',
            is_admin: true,
            is_affiliate: false
        },
        {
            id: 2,
            name: 'Jane Smith',
            user_id: 'USR002',
            phone: '+1-555-0102',
            email: 'jane@example.com',
            date_created: '2024-01-16',
            is_admin: false,
            is_affiliate: true
        },
        {
            id: 3,
            name: 'Bob Johnson',
            user_id: 'USR003',
            phone: '+1-555-0103',
            email: 'bob@example.com',
            date_created: '2024-01-17',
            is_admin: false,
            is_affiliate: false
        },
        {
            id: 4,
            name: 'Alice Brown',
            user_id: 'USR004',
            phone: '+1-555-0104',
            email: 'alice@example.com',
            date_created: '2024-01-18',
            is_admin: true,
            is_affiliate: true
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); // 'all', 'admin', 'non-admin'
    const [affiliateFilter, setAffiliateFilter] = useState('all'); // 'all', 'affiliate', 'non-affiliate'

    // Filter users based on search term and role filters
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(lowercasedSearch) ||
                user.user_id.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Apply admin filter
        if (adminFilter !== 'all') {
            filtered = filtered.filter(user =>
                adminFilter === 'admin' ? user.is_admin : !user.is_admin
            );
        }

        // Apply affiliate filter
        if (affiliateFilter !== 'all') {
            filtered = filtered.filter(user =>
                affiliateFilter === 'affiliate' ? user.is_affiliate : !user.is_affiliate
            );
        }

        return filtered;
    }, [users, searchTerm, adminFilter, affiliateFilter]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setAdminFilter('all');
        setAffiliateFilter('all');
    };

    const hasActiveFilters = searchTerm || adminFilter !== 'all' || affiliateFilter !== 'all';

    return (
        <div className="users-table-container">
            {/* Search and Filter Section */}
            <div className="Filters-container">
                <div className="search-filter-row">
                    <input
                        type="text"
                        placeholder="Search by email or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="clear-filters-btn"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="role-filters">
                    <div className="filter-group">
                        <label>Admin:</label>
                        <select
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All</option>
                            <option value="admin">Admin Only</option>
                            <option value="non-admin">Non-Admin</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Affiliate:</label>
                        <select
                            value={affiliateFilter}
                            onChange={(e) => setAffiliateFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All</option>
                            <option value="affiliate">Affiliate Only</option>
                            <option value="non-affiliate">Non-Affiliate</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>User ID</th>
                        <th className="hide-on-mobile">Phone</th>
                        <th>Email</th>
                        <th className="hide-on-small">Date Created</th>
                        <th>Admin</th>
                        <th>Affiliate</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="name-cell">{user.name}</td>
                                <td className="user-id-cell">{user.user_id}</td>
                                <td className="phone-cell hide-on-mobile">{user.phone}</td>
                                <td className="email-cell">{user.email}</td>
                                <td className="date-cell hide-on-small">
                                    {formatDate(user.date_created)}
                                </td>
                                <td className="status-cell">
                    <span className={`status-badge ${user.is_admin ? 'status-admin' : 'status-none'}`}>
                      {user.is_admin ? 'Yes' : 'No'}
                    </span>
                                </td>
                                <td className="status-cell">
                    <span className={`status-badge ${user.is_affiliate ? 'status-affiliate' : 'status-none'}`}>
                      {user.is_affiliate ? 'Yes' : 'No'}
                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-results">
                                No users found matching your filters
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Results Count */}
            <div className="results-count">
                Showing {filteredUsers.length} of {users.length} users
                {hasActiveFilters && ' (filtered)'}
            </div>
        </div>
    );
};

export default UsersTable;