import Link from 'next/link'
import { ArrowRight, Users, Award, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                <span className="text-background font-bold text-lg">F</span>
              </div>
              <h1 className="text-xl font-bold">Facil</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/termos" className="text-muted hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link href="/privacidade" className="text-muted hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link href="/admin" className="btn btn-primary">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-600 to-accent bg-clip-text text-transparent">
            Facil
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-8 leading-relaxed">
            Plataforma web simples e segura para gestão de apostas da 
            <span className="text-primary font-semibold"> Lotofácil da Independência</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/admin" className="btn btn-primary text-lg px-8 py-4">
              Acessar Admin
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/termos" className="btn btn-ghost text-lg px-8 py-4">
              Saiba Mais
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Seguro e Privado</h3>
            <p className="text-muted">
              Links de convite individuais com JWT assinado e expiração configurável
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Gestão Simples</h3>
            <p className="text-muted">
              Painel administrativo intuitivo para acompanhar apostas e participantes
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Integração Completa</h3>
            <p className="text-muted">
              Sincronização automática com Google Sheets para auditoria e relatórios
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Admin Cria Convite</h3>
              <p className="text-sm text-muted">Gera link único para participante específico</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Participante Acessa</h3>
              <p className="text-sm text-muted">Usa o link para acessar a plataforma</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Cria Apostas</h3>
              <p className="text-sm text-muted">Seleciona números e define cotas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Registro Automático</h3>
              <p className="text-sm text-muted">Dados salvos no Google Sheets</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted">
            <p>&copy; 2024 Facil. Plataforma para gestão de apostas.</p>
            <div className="mt-4 space-x-4">
              <Link href="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
