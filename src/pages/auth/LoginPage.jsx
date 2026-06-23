import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { loginApi } from '../../api/auth.api'

// import logo from '../../assets/logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setLogin, setTempToken } = useAuthStore()

  const [form, setForm]         = useState({ username: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginApi(form.username, form.password)
      setError('')    // ← solo se borra si el login fue exitoso
      if (data.requiresHotelSelection) {
        setTempToken(data.tempToken, data.hotels)
        navigate('/select-hotel')
      } else {
        setLogin(data)
        navigate('/')
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Credenciales incorrectas'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111008] px-4 py-8"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 55% 45% at 15% 15%, rgba(245,158,11,0.13) 0%, transparent 65%),
          radial-gradient(ellipse 45% 40% at 85% 85%, rgba(234,88,12,0.11) 0%, transparent 65%)
        `
      }}
    >
      <div className="w-full max-w-[400px] bg-[#1c1810] rounded-2xl px-9 pt-10 pb-8
                      border border-amber-500/20
                      shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_24px_64px_rgba(0,0,0,0.55)]">

        {/* ── LOGO ── */}
            <div className="flex flex-col items-center gap-1.5 mb-8">
      <img src="/mados-logo.png" alt="Mados Hotels" className="w-20 h-auto" />
      <span className="text-[1.2rem] font-bold tracking-[0.12em] uppercase
                      bg-linear-to-r from-amber-400 via-orange-400 to-amber-300
                      bg-clip-text text-transparent">
        Mados Hotels
      </span>
    </div>

        {/* Separador */}
        <div className="h-px bg-white/6 mb-6" />

        <p className="text-[#f0ebe0] font-semibold text-[1.05rem] mb-5">
          Iniciar Sesión
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* USUARIO */}
          <div className="space-y-1.5">
            <label htmlFor="username"
              className="block text-[0.68rem] font-medium tracking-[0.09em] uppercase text-stone-500">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Nombre de usuario"
                required
                className="w-full bg-[#0f0d09] border border-white/[0.07] rounded-[10px]
                           pl-9 pr-3 py-2.5 text-[0.86rem] text-[#f0ebe0]
                           placeholder:text-stone-700 outline-none
                           focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10
                           transition-all"
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div className="space-y-1.5">
            <label htmlFor="password"
              className="block text-[0.68rem] font-medium tracking-[0.09em] uppercase text-stone-500">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f0d09] border border-white/[0.07] rounded-[10px]
                           pl-9 pr-9 py-2.5 text-[0.86rem] text-[#f0ebe0]
                           placeholder:text-stone-700 outline-none
                           focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10
                           transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1
                           text-stone-600 hover:text-amber-500 transition-colors">
                {showPass
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-2.5
                            bg-red-950/30 border border-red-700/25 border-l-2 border-l-red-600
                            rounded-lg px-3.5 py-2.5 text-red-300 text-[0.8rem] leading-relaxed">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-1
                       rounded-[10px] font-semibold text-[0.88rem] text-[#180900]
                       bg-linear-to-br from-amber-400 to-orange-600
                       shadow-[0_6px_22px_rgba(245,158,11,0.26)]
                       hover:shadow-[0_8px_30px_rgba(245,158,11,0.38)] hover:-translate-y-px
                       active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200">
            {loading && (
              <span className="w-4 h-4 border-2 border-black/20 border-t-[#180900] rounded-full animate-spin" />
            )}
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

        </form>

        <p className="text-center text-stone-700 text-[0.68rem] mt-7">
          © 2026 Mados Hotels · Sistema de Gestión Hotelera
        </p>
      </div>
    </div>
  )
}