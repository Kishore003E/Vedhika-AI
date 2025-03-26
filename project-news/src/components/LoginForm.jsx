import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmailAndPassword, signInWithGoogle } from './firebase/auth'
import { FcGoogle } from 'react-icons/fc'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // This will also update the lastLogin in MongoDB
      await loginWithEmailAndPassword(email, password)
      console.log('Login successful')
      navigate('/')
    } catch (error) {
      setError(error.message)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    
    try {
      // This will also create/update the user in MongoDB
      await signInWithGoogle()
      console.log('Google sign-in successful')
      navigate('/')
    } catch (error) {
      setError(error.message)
      console.error('Google sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-60">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 p-3 rounded-md font-medium hover:bg-gray-50 transition duration-200"
      >
        <FcGoogle className="h-5 w-5 mr-2" />
        Sign in with Google
      </button>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </form>
  )
}