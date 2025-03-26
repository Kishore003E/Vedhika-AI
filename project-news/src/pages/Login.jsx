import LoginForm from '../components/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <h1 className="mt-6 mb-8 text-center text-3xl font-extrabold text-gray-900">
            Login
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}