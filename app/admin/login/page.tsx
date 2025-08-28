'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log('NEXT_PUBLIC_ADMIN_USER:', process.env.NEXT_PUBLIC_ADMIN_USER);
    console.log('NEXT_PUBLIC_ADMIN_PASSWORD:', process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação usando variáveis de ambiente definidas
    if (email === process.env.NEXT_PUBLIC_ADMIN_USER && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      // Persist session for dashboard guard
      try {
        sessionStorage.setItem('adminToken', 'dev-admin-token');
        sessionStorage.setItem('adminEmail', email);
      } catch {}
      console.log('Login successful, redirecting to /admin');
      router.push('/admin');
    } else {
      setError('Credenciais inválidas.');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Login Realizado!</h1>
          <p className="text-muted mb-6">
            Redirecionando para o painel administrativo...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <span className="text-background font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold">Facil</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Login Form */}
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Acesso Administrativo</h1>
              <p className="text-muted">
                Entre com suas credenciais para acessar o painel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="w-full p-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 pr-12 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn btn-primary py-4 flex items-center justify-center gap-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center text-sm text-muted">
                <p className="mb-2">Esqueceu suas credenciais?</p>
                <p>Entre em contato com o administrador principal</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Segurança</p>
                <p className="text-muted">
                  Esta área é restrita a administradores autorizados. Todas as ações são registradas 
                  para auditoria e segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="btn btn-ghost">
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
