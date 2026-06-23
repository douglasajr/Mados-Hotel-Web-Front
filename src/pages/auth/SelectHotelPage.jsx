import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { selectHotelApi } from '../../api/auth.api'
import { Building2, MapPin, LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function SelectHotelPage() {
  const navigate = useNavigate()
  const { hotels, tempToken, setSelectedHotel, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  const handleSelectHotel = async (hotelId) => {
    setSelected(hotelId)
    setLoading(true)
    setError('')
    try {
      const data = await selectHotelApi(tempToken, hotelId)
      setSelectedHotel(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al seleccionar hotel')
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#111008] px-4 py-8"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 55% 45% at 15% 15%, rgba(245,158,11,0.13) 0%, transparent 65%),
          radial-gradient(ellipse 45% 40% at 85% 85%, rgba(234,88,12,0.11) 0%, transparent 65%)
        `
      }}
    >
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1.5 mb-8">
          <img src="/mados-logo.png" alt="Mados Hotels" className="w-16 h-auto" />
          <span className="text-sm font-bold tracking-[0.12em] uppercase
                           bg-linear-to-r from-amber-400 via-orange-400 to-amber-300
                           bg-clip-text text-transparent">
            Mados Hotels
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#1c1810] border border-amber-500/20 rounded-2xl px-8 pt-8 pb-7
                        shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_24px_64px_rgba(0,0,0,0.55)]">

          <p className="text-[#f0ebe0] font-semibold text-[1.05rem] mb-1">
            Selecciona una sucursal
          </p>
          <p className="text-stone-500 text-[0.78rem] mb-6">
            ¿A qué hotel deseas acceder hoy?
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5
                            bg-red-950/30 border border-red-700/25 border-l-2 border-l-red-600
                            rounded-lg px-3.5 py-2.5 text-red-300 text-[0.8rem] leading-relaxed mb-4">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Hotel list */}
          <div className="space-y-2.5">
            {hotels?.map(hotel => {
              const isSelected = selected === hotel.id
              return (
                <button
                  key={hotel.id}
                  onClick={() => handleSelectHotel(hotel.id)}
                  disabled={loading}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border
                              text-left transition-all duration-200 disabled:opacity-50 group
                              ${isSelected
                                ? 'border-amber-500/60 bg-amber-500/10'
                                : 'border-white/[0.07] bg-[#0f0d09] hover:border-amber-500/40 hover:bg-amber-500/5'
                              }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                  ${isSelected
                                    ? 'bg-linear-to-br from-amber-400 to-orange-600'
                                    : 'bg-amber-500/10 group-hover:bg-amber-500/15'
                                  }`}>
                    {isSelected && loading
                      ? <Loader2 size={18} className="text-[#180900] animate-spin" />
                      : <Building2 size={18} className={isSelected ? 'text-[#180900]' : 'text-amber-500/70'} />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[0.88rem] truncate transition-colors
                                  ${isSelected ? 'text-amber-300' : 'text-[#f0ebe0]'}`}>
                      {hotel.name}
                    </p>
                    <p className="flex items-center gap-1 text-[0.74rem] text-stone-500 mt-0.5">
                      <MapPin size={10} />
                      {hotel.city}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg className={`shrink-0 transition-all duration-200
                                  ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-600 group-hover:text-amber-500/50 group-hover:translate-x-0.5'}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/6 mt-6 mb-5" />

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center justify-center gap-2
                       text-stone-600 hover:text-red-400 text-[0.78rem] transition-colors"
          >
            <LogOut size={13} />
            Volver al login
          </button>

        </div>

        <p className="text-center text-stone-700 text-[0.68rem] mt-6">
          © 2026 Mados Hotels · Sistema de Gestión Hotelera
        </p>
      </div>
    </div>
  )
}