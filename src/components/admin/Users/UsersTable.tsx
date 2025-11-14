import './UsersTable.css';
import { useState, useMemo, useEffect } from 'react';
import { userService } from '@/services/AdminServices/adminUserServices.ts';

interface User {
    id: bigint;
    name: string | null;
    auth_id: string;
    is_admin: boolean;
    is_affiliate: boolean;
}

const UsersTable = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState('all');
    const [affiliateFilter, setAffiliateFilter] = useState('all');

    // Fetch users from Supabase
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const usersData = await userService.getAllUsers();
                setUsers(usersData);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search term and role filters
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                (user.name?.toLowerCase().includes(lowercasedSearch) || false) ||
                user.auth_id.toLowerCase().includes(lowercasedSearch)
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

    const clearFilters = () => {
        setSearchTerm('');
        setAdminFilter('all');
        setAffiliateFilter('all');
    };

    const hasActiveFilters = searchTerm || adminFilter !== 'all' || affiliateFilter !== 'all';

    if (loading) {
        return (
            <div className="users-table-container">
                <div className="loading-state">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="users-table-container">
                <div className="error-state">
                    {error}
                    <button
                        onClick={() => window.location.reload()}
                        className="retry-btn"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="users-table-container">
            {/* Search and Filter Section */}
            <div className="Filters-container">
                <div className="search-filter-row">
                    <input
                        type="text"
                        placeholder="Search by name or auth ID..."
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Auth ID</th>
                        <th>Admin</th>
                        <th>Affiliate</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="id-cell">{user.id.toString()}</td>
                                <td className="name-cell">{user.name || 'N/A'}</td>
                                <td className="auth-id-cell">{user.auth_id}</td>
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
                            <td colSpan="5" className="no-results">
                                {users.length === 0 ? 'No users found' : 'No users found matching your filters'}
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