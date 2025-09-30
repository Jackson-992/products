import React, {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Star} from 'lucide-react';
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Input} from '@/components/ui/input';
import './ReviewForm.css';

interface ReviewFormProps {
    productId: string,
    onSubmit: (review: { rating: number; comment: string }) => void,
    isSubmitting?: boolean
}

const ReviewForm: React.FC<ReviewFormProps> = ({productId, onSubmit, isSubmitting}) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [ratingInput, setRatingInput] = useState<string>('');

    // Sync the numeric input with the rating state
    useEffect(() => {
        setRatingInput(rating > 0 ? rating.toFixed(1) : '');
    }, [rating]);

    // Handle numeric input change with strict validation
    const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty input
        if (value === '') {
            setRatingInput('');
            setRating(0);
            return;
        }

        // Validate format: only numbers with optional single decimal
        const decimalRegex = /^\d*(\.\d{0,1})?$/;
        if (!decimalRegex.test(value)) {
            return; // Don't update if invalid format
        }

        const numValue = parseFloat(value);

        // Check if value is within valid range (0.1 to 5.0)
        if (!isNaN(numValue)) {
            if (numValue >= 1.0 && numValue <= 5.0) {
                // Valid range - format to one decimal place
                const formattedValue = Math.round(numValue * 10) / 10;
                setRatingInput(value); // Allow typing
                setRating(formattedValue);
            } else if (numValue > 5.0) {
                // Value exceeds maximum - cap at 5.0
                setRatingInput('5.0');
                setRating(5.0);
            } else if (numValue < 1.0 && numValue > 0) {
                // Value below minimum but greater than 0 - set to minimum
                setRatingInput('1.0');
                setRating(1.0);
            } else {
                // Invalid value (negative or 0) - allow typing but don't set rating
                setRatingInput(value);
                setRating(0);
            }
        } else {
            // Not a valid number - allow typing but don't set rating
            setRatingInput(value);
            setRating(0);
        }
    };

    // Handle numeric input blur - final validation and formatting
    const handleRatingInputBlur = () => {
        if (ratingInput === '' || ratingInput === '0') {
            setRating(0);
            setRatingInput('');
            return;
        }

        const numValue = parseFloat(ratingInput);

        if (isNaN(numValue)) {
            setRating(0);
            setRatingInput('');
        } else {
            // Clamp value between 1.0 and 5.0
            const clampedValue = Math.max(1.0, Math.min(5.0, numValue));
            const formattedValue = Math.round(clampedValue * 10) / 10;

            setRating(formattedValue);
            setRatingInput(formattedValue.toFixed(1));
        }
    };

    // Prevent invalid key presses
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent multiple decimal points
        if (e.key === '.' && ratingInput.includes('.')) {
            e.preventDefault();
            return;
        }

        // Allow only numbers and decimal point
        if (!/[\d.]/.test(e.key)) {
            e.preventDefault();
            return;
        }
    };

    const handleStarClick = (star: number) => {
        setRating(star);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating between 0.1 and 5.0');
            return;
        }

        onSubmit({
            rating: parseFloat(rating.toFixed(1)),
            comment
        });
        setRating(0);
        setComment('');
        setRatingInput('');
    };

    return (
        <Card className="review-form-card">
            <CardContent>
                <h4 className="review-form-title">Write a Review</h4>
                <form onSubmit={handleSubmit} className="review-form">
                    <div className="rating-input-section">
                        <div className="rating-input">
                            <div className="rating-controls">
                                {/* Numeric Input */}
                                <div className="numeric-rating-input">
                                    <Input
                                        type="number"
                                        min="1.0"
                                        max="5"
                                        step="0.1"
                                        value={ratingInput}
                                        onChange={handleRatingInputChange}
                                        onBlur={handleRatingInputBlur}
                                        onKeyPress={handleKeyPress}
                                        placeholder="1.0 - 5.0"
                                        className="rating-number-input"
                                    />
                                    <span className="rating-scale">/5</span>
                                </div>

                                {/* Star Rating Display */}
                                <div className="stars-display">
                                    <div className="stars-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleStarClick(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="star-button"
                                            >
                                                <Star
                                                    className={`star-input-icon ${
                                                        star <= (hoveredRating || Math.ceil(rating)) ? 'star-filled' : 'star-empty'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="comment-input">
                        <label htmlFor="comment" className="comment-label">
                            Your Review:
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            className="comment-textarea"
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ReviewForm;