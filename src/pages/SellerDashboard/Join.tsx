import "./Join.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Join = () => {
    const navigate = useNavigate();
    const [affiliateCode, setAffiliateCode] = useState("");
    const [hasCode, setHasCode] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step, setStep] = useState(1); // 1: Code entry, 2: Phone number
    const [isLoading, setIsLoading] = useState(false);

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        if (hasCode && !affiliateCode.trim()) {
            alert("Please enter an affiliate code");
            return;
        }
        setStep(2);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            alert("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);

        try {
            // Process payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // After successful payment, redirect
            navigate("/seller-dashboard")

        } catch (error) {
            alert("Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    const goBack = () => {
        setStep(1);
    };

    return (
        <div className="join-container">
            <div className="join-card">
                <h1>Become an Affiliate</h1>
                <p className="join-subtitle">Join our affiliate program and start earning</p>

                {step === 1 && (
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

                {step === 2 && (
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
                                onChange={(e) => setPhoneNumber(e.target.value)}
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
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="pay-btn"
                            >
                                {isLoading ? "Processing..." : "Pay 500 KSH"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Join;