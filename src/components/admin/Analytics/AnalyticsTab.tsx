import './AnalyticsTab.css'
import { useState } from 'react'
import SalesTab from './Sales'
import ReferralsTab from './Refs'
import AffiliateSalesTab from './Affs'

const AnalyticsTab = () => {
    const [activeTab, setActiveTab] = useState('sales')

    const tabs = [
        { id: 'sales', label: 'Sales Analytics' },
        { id: 'referrals', label: 'Referrals' },
        { id: 'affiliate', label: 'Affiliate Sales' }
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales':
                return <SalesTab />
            case 'referrals':
                return <ReferralsTab />
            case 'affiliate':
                return <AffiliateSalesTab />
            default:
                return <SalesTab />
        }
    }

    return (
        <div className="analytics-tab">
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
                {renderTabContent()}
            </div>
        </div>
    )
}

export default AnalyticsTab