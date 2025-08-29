// Facil/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Plus,
  TrendingUp,
  Activity,
  Calendar,
  LogOut,
  AlertCircle,
  Eye, 
} from 'lucide-react'

interface DashboardStats {
  totalBets: number
  totalShares: number
  totalParticipants: number
  recentBets: number
  campaignStatus: 'active' | 'paused' | 'ended'
  campaignName: string;
  lastUpdate: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string>('')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null); 
  const router = useRouter()

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      loadDashboardData(selectedCampaignId);
    } else {
      const storedSelectedCampaignId = sessionStorage.getItem('selectedCampaignId');
      if (storedSelectedCampaignId) {
        setSelectedCampaignId(storedSelectedCampaignId);
      } else {
        router.push('/admin/campaigns');
      }
    }
  }, [selectedCampaignId, router]);

  const checkAuth = () => {
    const token = sessionStorage.getItem('adminToken')
    const email = sessionStorage.getItem('adminEmail')
    
    if (!token || !email) {
      router.push('/admin/login')
      return
    }
    
    setAdminEmail(email)
  }

  const loadDashboardData = async (campaignId: string) => { 
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/dashboard?campaignId=${campaignId}`, { 
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('adminToken')
          sessionStorage.removeItem('adminEmail')
          sessionStorage.removeItem('selectedCampaignId'); 
          router.push('/admin/login')
          return
        }
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminEmail')
    sessionStorage.removeItem('selectedCampaignId'); 
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erro ao Carregar</h1>
          <p className="text-muted mb-6">{error}</p>
          <button onClick={() => loadDashboardData(selectedCampaignId!)} className="btn btn-primary"> 
            Tentar Novamente
          </button>
          <div className="mt-4">
            <Link href="/admin/campaigns" className="btn btn-ghost">
              <Eye className="w-4 h-4" /> Gerenciar Campanhas
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-xl font-bold">Facil Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {adminEmail}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-ghost text-error hover:text-error/80"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted">
            Visão geral da campanha <span className="font-semibold text-primary">{stats.campaignName}</span>
          </p>
        </div>

        {/* Campaign Status */}
        <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Status da Campanha</h2>
              <span className={`badge ${
                stats.campaignStatus === 'active' ? 'ok' : 
                stats.campaignStatus === 'paused' ? 'warn' : 'err'
              }`}>
                {stats.campaignStatus === 'active' ? 'Ativa' : 
                 stats.campaignStatus === 'paused' ? 'Pausada' : 'Encerrada'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Última atualização: {new Date(stats.lastUpdate).toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted">
                Você está visualizando a campanha: <span className="font-bold text-foreground">{stats.campaignName}</span> (ID: {selectedCampaignId})
            </div>
        </div>

        {/* REMOVIDO: Stats Grid (Total de Apostas, Cotas, Participantes, Recentes) */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total de Apostas</p>
                  <p className="text-2xl font-bold">{stats.totalBets}</p>
                </div>
              </div>
            </div>
  
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total de Cotas</p>
                  <p className="text-2xl font-bold">{stats.totalShares}</p>
                </div>
              </div>
            </div>
  
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Participantes</p>
                  <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                </div>
              </div>
            </div>
  
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Apostas Recentes</p>
                  <p className="text-2xl font-bold">{stats.recentBets}</p>
                </div>
              </div>
            </div>
          </div> */}

        {/* Quick Actions (Mantidos) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/campaigns" className="card p-6 hover:border-primary transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gerenciar Campanhas</h3>
                  <p className="text-sm text-muted">Criar, editar e selecionar campanhas</p>
                </div>
              </div>
            </Link>

          <Link href="/admin/convites" className="card p-6 hover:border-primary transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gerar Convites</h3>
                <p className="text-sm text-muted">Criar novos links de acesso</p>
              </div>
            </div>
          </Link>
          
          <Link href={`/admin/campaign-bets-dashboard?campaignId=${selectedCampaignId}`} className="card p-6 hover:border-primary transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Ver Apostas da Campanha</h3>
                <p className="text-sm text-muted">Acompanhar todas as apostas registradas</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Recent Activity (Mantido) */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm">Nova aposta registrada</span>
              </div>
              <span className="text-xs text-muted">há 5 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm">Convite gerado para João Silva</span>
              </div>
              <span className="text-xs text-muted">há 15 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm">Campanha atualizada</span>
              </div>
              <span className="text-xs text-muted">há 1 hora</span>
            </div>
          </div>
        </div>

        {/* REMOVIDO: Navigation Links (últimos 4 botões) */}
        {/* <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/campaigns" className="btn btn-ghost py-3 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Gerenciar Campanhas
            </Link>
          <Link href="/admin/convites" className="btn btn-ghost py-3 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Convites
          </Link>
          <Link href={`/admin/campaign-bets-dashboard?campaignId=${selectedCampaignId}`} className="btn btn-ghost py-3 flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Ver Apostas da Campanha
          </Link>
            <Link href={`/admin/campaigns/edit/${selectedCampaignId}`} className="btn btn-ghost py-3 flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações da Campanha
            </Link>
        </div> */}
      </main>
    </div>
  )
}