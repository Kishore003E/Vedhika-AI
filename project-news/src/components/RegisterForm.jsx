import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmailAndPassword, signInWithGoogle } from './firebase/auth'
import { FcGoogle } from 'react-icons/fc' 

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [interests, setInterests] = useState({
    technology: false,
    business: false,
    science: false,
    health: false,
    entertainment: false,
    sports: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInterestChange = (e) => {
    const { name, checked } = e.target
    setInterests((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    setLoading(true)
    
    try {
      const user = await registerWithEmailAndPassword(email, password, interests)
      console.log('Registration successful:', user)
      navigate('/login')
    } catch (error) {
      setError(error.message)
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    
    try {
      const user = await signInWithGoogle()
      console.log('Google sign-in successful:', user)
      navigate('/')
    } catch (error) {
      setError(error.message)
      console.error('Google sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-6">
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
      
      <div className="mb-6">
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
      
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <p className="block text-sm font-medium text-gray-700 mb-2">Interests</p>
        <div className="space-y-2">
          {Object.keys(interests).map((interest) => (
            <div key={interest} className="flex items-center">
              <input
                type="checkbox"
                id={interest}
                name={interest}
                checked={interests[interest]}
                onChange={handleInterestChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={interest} className="ml-2 block text-gray-700 capitalize">
                {interest}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
      >
        {loading ? 'Registering...' : 'Register'}
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
        Sign up with Google
      </button>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}