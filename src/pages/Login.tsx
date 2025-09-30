import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, Mail, Lock, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {supabase} from '@/services/supabase.ts'
import {Eye, EyeOff} from "lucide-react";

const Login = () => {
    const navigate = useNavigate(); // Add this hook for navigation
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{type: string, text: string} | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showResetForm, setShowResetForm] = useState(false)
    const [resetEmail, setResetEmail] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Show success message briefly, then redirect
            setMessage({ type: 'success', text: 'Login successful! Redirecting...' })

            // Redirect to home page after successful login
            setTimeout(() => {
                navigate('/'); // or navigate('/') if your home route is '/'
            }, 1000); // Small delay to show success message

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `http://localhost:8080/reset-password`,
            })

            if (error) throw error

            setMessage({
                type: 'success',
                text: 'Check your email for the password reset link.'
            })
            setShowResetForm(false)

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-blue-600">
                        254_Connect
                    </Link>
                    <p className="text-gray-600 mt-2">Welcome back to your marketplace</p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            {showResetForm ? 'Reset Password' : 'Login'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded-md ${
                                message.type === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {showResetForm ? (
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resetEmail">Email Address</Label>
                                    <Input
                                        id="resetEmail"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowResetForm(false)}
                                >
                                    Back to Login
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </Button>

                                <button
                                    type="button"
                                    className="text-blue-600 text-sm"
                                    onClick={() => setShowResetForm(true)}
                                >
                                    Forgot your password?
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                                            Sign up
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-8">
                    By signing in, you agree to our{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;