import { useState, useEffect } from 'react';
import { affiliateService } from '@/services/AdminServices/adminAffiliateServices.ts';

export const useAffiliates = () => {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAffiliates = async () => {
            try {
                setLoading(true);
                let data;
                try {
                    data = await affiliateService.getAffiliates();
                } catch (firstError) {
                    console.log('First method failed, trying alternative:', firstError);
                    data = await affiliateService.getAffiliatesWithUserProfiles();
                }

                setAffiliates(data);
                setError(null);
            } catch (err) {
                console.error('Error in useAffiliates:', err);
                setError(err.message);
                setAffiliates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAffiliates();
    }, []);

    // Function to refresh affiliate data
    const refreshAffiliates = async () => {
        try {
            setLoading(true);
            const data = await affiliateService.getAffiliates();
            setAffiliates(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { affiliates, loading, error, refreshAffiliates };
};