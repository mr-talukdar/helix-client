'use client'

import { ArrowRight, Loader2 } from 'lucide-react'

interface FooterActionProps {
  onNext: () => void
  label?: string
  loading?: boolean
  disabled?: boolean
  showDisclaimer?: boolean
}

export function FooterAction({ 
  onNext, 
  label = "Next Step", 
  loading = false, 
  disabled = false,
  showDisclaimer = false
}: FooterActionProps) {
  return (
    <footer className="w-full max-w-md p-6 mb-8 mt-auto">
      <button 
        onClick={onNext}
        disabled={disabled || loading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-lg">{label}</span>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        )}
      </button>
      
      {showDisclaimer && (
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a>.
          </p>
        </div>
      )}
    </footer>
  )
}
