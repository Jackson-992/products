import './Payment.css';
import { useState } from 'react';
import SalesCommission from './SalesCommission';
import ReferralCommission from './ReferalsCommission';
import RegistrationPayments from './RegistrationPayments';
import Withdrawals from './Withdrawals';

const Payment = () => {
    const [activeTab, setActiveTab] = useState('sales');

    const tabs = [
        { id: 'sales', label: 'Sales Commission', component: SalesCommission },
        { id: 'referrals', label: 'Referral Commission', component: ReferralCommission },
        { id: 'registrations', label: 'Registration Payments', component: RegistrationPayments },
        { id: 'withdrawals', label: 'Withdrawals', component: Withdrawals }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="payment-container">
            <div className="payment-header">
                <h1>Payment Management</h1>
            </div>

            <div className="tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default Payment;