// Facil/app/admin/campaigns/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash, Loader2, AlertCircle } from 'lucide-react' 

// Remova as importações diretas de funções do Firebase-db.ts
// import { getAllCampaigns, createCampaign, deleteCampaign } from '@/lib/firebase-db' 

type Campaign = {
  id: string
  name: string
  slug?: string
  status?: 'active' | 'paused' | 'ended'
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken')
    const email = sessionStorage.getItem('adminEmail')
    if (!token || !email) {
      router.push('/admin/login')
      return
    }

    loadCampaigns()
  }, [router])

  async function loadCampaigns() {
    setLoading(true)
    setError(null)
    try {
      const token = sessionStorage.getItem('adminToken')
      if (!token) { // Verifica novamente o token antes de fazer a chamada
        router.push('/admin/login')
        return
      }

      // Chama a API Route para obter todas as campanhas
      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) { // Token expirado ou inválido
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminEmail');
            router.push('/admin/login');
        }
        throw new Error('Erro ao carregar campanhas.');
      }
      
      const data: Campaign[] = await response.json()
      setCampaigns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    setError(null);
    try {
      const token = sessionStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      // Chama a API Route para criar uma nova campanha
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: 'Nova Campanha', 
          status: 'paused',
          pricePerShare: 3.5, // Adicione valores padrão necessários pelo backend
          numbersPerBet: 15
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar campanha.');
      }
      
      const newCampaign: Campaign = await response.json()
      await loadCampaigns() // Recarrega a lista para incluir a nova campanha
      if (newCampaign && newCampaign.id) {
        router.push(`/admin/campaigns/edit/${newCampaign.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja remover esta campanha?')) return
    setError(null);
    try {
      const token = sessionStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      // Chama a API Route para remover a campanha
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover campanha.');
      }
      
      await loadCampaigns() // Recarrega a lista após a exclusão
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover')
    }
  }

  const handleViewDashboard = (campaignId: string) => {
    sessionStorage.setItem('selectedCampaignId', campaignId);
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-b-2 border-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted">Carregando campanhas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-center w-full">Campanhas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="card p-4 mb-4 text-error flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4">
          {campaigns.length === 0 && !loading && (
            <div className="card p-6 text-center">Nenhuma campanha encontrada.</div>
          )}

          {campaigns.map(c => (
            <div
              key={c.id}
              className="card p-4 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleViewDashboard(c.id)}
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-muted">ID: {c.id} • Status: {c.status || 'paused'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/campaigns/edit/${c.id}`}
                  onClick={(e) => e.stopPropagation()} // Impede que o clique no Link ative o onClick do div pai
                  className="btn btn-ghost"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Impede que o clique no botão ative o onClick do div pai
                    handleDelete(c.id);
                  }}
                  className="btn btn-ghost text-error"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={handleCreate} className="btn btn-primary w-full max-w-sm flex items-center justify-center" disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Criar Campanha
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}