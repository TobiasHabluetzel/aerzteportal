import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [organisationCode, setOrganisationCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(organisationCode, username, password)
      navigate('/cases', { replace: true })
    } catch {
      setError('Login fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Anmelden</h1>
        <p className="text-sm text-gray-500">Greifen Sie auf die Ihnen zugewiesenen Fälle zu.</p>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
            <input
              value={organisationCode}
              onChange={e => setOrganisationCode(e.target.value)}
              autoComplete="organization"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-red"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || !organisationCode || !username || !password}
            className="w-full bg-brand-red text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40"
          >
            {busy ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
