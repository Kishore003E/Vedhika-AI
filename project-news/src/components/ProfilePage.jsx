import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from './firebase/auth'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setDisplayName(currentUser.displayName || '')
      } else {
        navigate('/login')
      }
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      })
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setUser({...user, displayName})
    } catch (error) {
      setError('Failed to update profile: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="ProfilePage" 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setDisplayName(user.displayName || '')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Display Name</p>
                <p className="font-medium">{user?.displayName || 'Not set'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium">
                {user?.providerData[0]?.providerId === 'password' 
                  ? 'Email and Password' 
                  : user?.providerData[0]?.providerId === 'google.com'
                    ? 'Google Account'
                    : user?.providerData[0]?.providerId || 'Unknown'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium">
                {user?.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString() 
                  : 'Unknown'}
              </p>
            </div>
            
            <div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}