import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, User, MailIcon } from 'lucide-react';
import './ContactUs.css';

const ContactUs = () => {
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            text: "Hello! How can we help you today?",
            sender: 'agent',
            timestamp: new Date().toISOString()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [isChatMinimized, setIsChatMinimized] = useState(false);

    const contactMethods = [
        {
            icon: <Phone className="contact-icon" />,
            title: "Call Us",
            details: [
                "+254 700 123 456",
                "+254 711 987 654"
            ],
            description: "Available 24/7 for urgent inquiries",
            action: "Call Now"
        },
        {
            icon: <Mail className="contact-icon" />,
            title: "Email Us",
            details: [
                "support@shopsphere.com",
                "info@shopsphere.com",
                "sales@shopsphere.com"
            ],
            description: "We'll respond within 2 hours",
            action: "Send Email"
        },
        {
            icon: <MapPin className="contact-icon" />,
            title: "Visit Us",
            details: [
                "ShopSphere Headquarters",
                "123 Business Plaza, 5th Floor",
                "Nairobi, Kenya"
            ],
            description: "Open Monday - Friday, 8:00 AM - 6:00 PM",
            action: "Get Directions"
        }
    ];

    const faqs = [
        {
            question: "What are your customer service hours?",
            answer: "Our customer service team is available 24/7 via phone and live chat. Email support responses are typically within 2 hours."
        },
        {
            question: "How can I track my order?",
            answer: "You can track your order through your account dashboard or using the tracking number provided in your shipping confirmation email."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for all items in original condition. Some items may have specific return conditions."
        }
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Add user message
        const userMessage = {
            id: chatMessages.length + 1,
            text: newMessage,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        // Simulate agent response after a delay
        setTimeout(() => {
            const agentResponse = {
                id: chatMessages.length + 2,
                text: "Thank you for your message. Our support team will get back to you shortly. Is there anything specific we can help you with?",
                sender: 'agent',
                timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, agentResponse]);
        }, 2000);
    };

    const handleContactAction = (method, detail) => {
        switch (method) {
            case 'Call Us':
                window.open(`tel:${detail}`);
                break;
            case 'Email Us':
                window.open(`mailto:${detail}`);
                break;
            case 'Visit Us':
                // Open maps or navigation
                console.log('Get directions to:', detail);
                break;
            default:
                break;
        }
    };

    return (
        <div className="contact-container">
            {/* Header Section */}
            <div className="contact-header">
                <h1 className="contact-title">Contact Us</h1>
                <p className="contact-subtitle">
                    We're here to help! Get in touch with us through any of the methods below.
                </p>
            </div>

            <div className="contact-content">
                {/* Contact Methods Grid */}
                <div className="contact-methods-grid">
                    {contactMethods.map((method, index) => (
                        <div key={index} className="contact-card">
                            <div className="contact-card-header">
                                {method.icon}
                                <h3 className="contact-card-title">{method.title}</h3>
                            </div>
                            <div className="contact-card-body">
                                {method.details.map((detail, idx) => (
                                    <div key={idx} className="contact-detail">
                                        <span className="contact-detail-text">{detail}</span>
                                        <button
                                            className="contact-action-btn"
                                            onClick={() => handleContactAction(method.title, detail)}
                                        >
                                            {method.action}
                                        </button>
                                    </div>
                                ))}
                                <p className="contact-description">{method.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <h2 className="faq-title">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-card">
                                <h4 className="faq-question">{faq.question}</h4>
                                <p className="faq-answer">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Chat Widget */}
                <div className={`chat-widget ${isChatMinimized ? 'minimized' : ''}`}>
                    <div className="chat-header" onClick={() => setIsChatMinimized(!isChatMinimized)}>
                        <div className="chat-header-info">
                            <MessageCircle className="chat-icon" />
                            <div>
                                <h3 className="chat-title">Live Chat Support</h3>
                                <span className="chat-status">
                                    <span className="status-dot online"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button className="minimize-btn">
                            {isChatMinimized ? '+' : '−'}
                        </button>
                    </div>

                    {!isChatMinimized && (
                        <div className="chat-body">
                            {/* User Info Form */}
                            {!userInfo.name && (
                                <div className="user-info-form">
                                    <h4>Let's get started</h4>
                                    <p>Please provide your details to start the chat</p>
                                    <div className="user-info-fields">
                                        <div className="input-group">
                                            <User className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                value={userInfo.name}
                                                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                                                className="user-input"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <MailIcon className="input-icon" />
                                            <input
                                                type="email"
                                                placeholder="Your Email"
                                                value={userInfo.email}
                                                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                                                className="user-input"
                                            />
                                        </div>
                                        <button
                                            className="start-chat-btn"
                                            disabled={!userInfo.name || !userInfo.email}
                                            onClick={() => console.log('Chat started with:', userInfo)}
                                        >
                                            Start Chat
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Chat Messages */}
                            {userInfo.name && (
                                <>
                                    <div className="chat-messages">
                                        {chatMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`message ${message.sender === 'user' ? 'user-message' : 'agent-message'}`}
                                            >
                                                <div className="message-bubble">
                                                    <p className="message-text">{message.text}</p>
                                                    <span className="message-time">
                                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={handleSendMessage} className="message-input-form">
                                        <div className="message-input-container">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="message-input"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="send-button"
                                            >
                                                <Send className="send-icon" />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Additional Information */}
                <div className="additional-info">
                    <div className="info-card">
                        <Clock className="info-icon" />
                        <div className="info-content">
                            <h4>Response Time</h4>
                            <p>Phone: Immediate</p>
                            <p>Live Chat: Under 20 minutes</p>
                            <p>Email: Within 12 hours</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <MessageCircle className="info-icon" />
                        <div className="info-content">
                            <h4>Support Languages</h4>
                            <p>English & Swahili</p>
                            <p>Multilingual support available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;