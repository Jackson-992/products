// components/AuthCallback.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'

const AuthCallback = () => {
    const [message, setMessage] = useState('Completing sign up...')
    const navigate = useNavigate()

    useEffect(() => {
        // Check for the session after email confirmation
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setMessage('Success! Your email has been verified.')
                setTimeout(() => navigate('/dashboard'), 2000)
            } else {
                setMessage('Unable to verify your email. Please try again.')
            }
        })
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">{message}</h1>
                {message.includes('Unable') && (
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Sign Up
                    </button>
                )}
            </div>
        </div>
    )
}

export default AuthCallback