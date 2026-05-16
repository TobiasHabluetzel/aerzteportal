import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function CasesPage() {
  const { user, logout } = useAuth()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Doctor'

  return (
    <Layout>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Willkommen, {name}</h1>
          <p className="text-sm text-gray-500 mt-1">Ihre offenen Fälle</p>
        </div>
        <button onClick={() => logout()} className="text-xs text-gray-400 hover:text-gray-700 underline">
          Abmelden
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm px-5 py-6 text-sm text-gray-500 mt-5 text-center">
        Die Fallliste wird im nächsten Schritt aktiviert.
      </div>
    </Layout>
  )
}
