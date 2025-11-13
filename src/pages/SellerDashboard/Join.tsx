import "./Join.css";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAffiliateStatus } from "@/hooks/checkAffiliateStatus.ts";
import { createPayment } from "@/services/CommonServices/PaymentServices.ts";
import { supabase } from '@/services/supabase';
import { useToast } from '@/components/ui/use-toast';
import {Button} from "@/components/ui/button.tsx";

const Join = () => {
    const navigate = useNavigate();
    const [affiliateCode, setAffiliateCode] = useState("");
    const [hasCode, setHasCode] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const [error, setError] = useState("");
    const [userProfile, setUserProfile] = useState<any>(null);
    const { toast } = useToast();

    const { loading: checkingStatus } = useAffiliateStatus(true);

    useEffect(() => {
        getUserProfile();
    }, []);

    const getUserProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('auth_id', session.user.id)
                    .single();

                if (!error && profile) {
                    setUserProfile(profile);
                } else {
                    console.error('Error fetching user profile:', error);
                    setUserProfile(null);
                }
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            setUserProfile(null);
        }
    };

    const getCurrentUserId = (): number | null => {
        return userProfile?.id || null;
    };

    const validateAffiliateCode = async (code: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('affiliate_profiles')
                .select('affiliate_code')
                .eq('affiliate_code', code)
                .single();

            return !error && data !== null;
        } catch (error) {
            console.error('Error validating affiliate code:', error);
            return false;
        }
    };

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (hasCode && !affiliateCode.trim()) {
            alert("Please enter an affiliate code");
            return;
        }
        setStep(2);
    };

    const processMpesaPayment = async (phone, amount, paymentId) => {
        console.log(`Processing M-Pesa payment: ${amount} KSH to ${phone} for payment ID: ${paymentId}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Promise.resolve();
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError("");

        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        // Validate affiliate code before creating payment
        if (hasCode && affiliateCode.trim()) {
            const isValidCode = await validateAffiliateCode(affiliateCode.trim());
            if (!isValidCode) {
                toast({
                    title: "Incorrect Affiliate code",
                    description: "The affiliate code you entered does not exist. Please confirm with your Referer",
                    variant: "destructive",
                });
                return;
            }
        }

        setIsLoading(true);

        try {
            const userId = await getCurrentUserId();

            const paymentResult = await createPayment({
                user_id: userId,
                amount: 500,
                phone_number: phoneNumber,
                referer_code: hasCode && affiliateCode.trim() ? affiliateCode.trim() : null,
            });

            if (!paymentResult.success) {
                throw new Error(paymentResult.error);
            }

            await processMpesaPayment(phoneNumber, 500, paymentResult.payment.id);

            // Set payment as initiated and show refresh message
            setPaymentInitiated(true);

            toast({
                title: "Payment Initiated",
                description: "Check your phone to complete the M-Pesa payment",
                variant: "default",
            });

        } catch (error) {
            console.error('Payment error:', error);

            toast({
                title: "Payment Failure",
                description: "Payment failed, please try again",
                variant: "default",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        setError("");
        setStep(1);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    if (checkingStatus) {
        return (
            <div className="join-container">
                <div className="join-card">
                    <div className="Loading-spinner">
                        <div className="Spinner"></div>
                        <p>Checking your status...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="join-container">
            <div className="join-card">
                <h1>Become an Affiliate</h1>
                <p className="join-subtitle">Join our affiliate program and start earning</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {paymentInitiated && (
                    <div className="refresh-message">
                        <div className="message-icon">💳</div>
                        <h3>Payment Initiated Successfully</h3>
                        <p>After completing payment, refresh page to access your dashboard</p>
                        <Button
                            onClick={handleRefresh}
                            className="refresh-btn"
                        >
                            Refresh Page
                        </Button>
                    </div>
                )}

                {!paymentInitiated && step === 1 && (
                    <form onSubmit={handleCodeSubmit} className="join-form">
                        <div className="form-group">
                            <label htmlFor="affiliateCode">
                                Affiliate Code (Optional)
                            </label>
                            <input
                                type="text"
                                id="affiliateCode"
                                value={affiliateCode}
                                onChange={(e) => setAffiliateCode(e.target.value)}
                                placeholder="Enter affiliate code if you have one"
                                disabled={!hasCode}
                            />
                        </div>

                        <div className="code-option">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={hasCode}
                                    onChange={(e) => setHasCode(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                I have an affiliate code
                            </label>
                        </div>

                        <button type="submit" className="continue-btn">
                            Continue
                        </button>

                        {!hasCode && (
                            <p className="no-code-info">
                                No problem! You can join without a referral code and still enjoy all affiliate benefits.
                            </p>
                        )}
                    </form>
                )}

                {!paymentInitiated && step === 2 && (
                    <form onSubmit={handlePayment} className="join-form">
                        <div className="step-indicator">
                            <span className="step active">1</span>
                            <div className="step-line"></div>
                            <span className="step active">2</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">
                                Phone Number for Payment
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Enter your phone number (e.g., 0712345678)"
                                required
                            />
                            <small className="input-hint">
                                We'll send a payment request to this number via M-Pesa
                            </small>
                        </div>

                        <div className="payment-summary">
                            <h3>Payment Summary</h3>
                            <div className="payment-details">
                                <div className="payment-row">
                                    <span>Affiliate Registration Fee:</span>
                                    <span>500 KSH</span>
                                </div>
                                {hasCode && affiliateCode && (
                                    <div className="payment-row">
                                        <span>Referred by:</span>
                                        <span>{affiliateCode}</span>
                                    </div>
                                )}
                                <div className="payment-total">
                                    <span>Total:</span>
                                    <span>500 KSH</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={goBack}
                                className="back-btn"
                                disabled={isLoading}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="pay-btn"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        Processing...
                                    </>
                                ) : (
                                    "Pay 500 KSH"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Join;