// Facil/app/admin/campaigns/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash } from 'lucide-react' 
import { getAllCampaigns, createCampaign, deleteCampaign } from '@/lib/firebase-db' 

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
      const data = await getAllCampaigns()
      setCampaigns(data as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const newCampaign = await createCampaign({ name: 'Nova Campanha', slug: '', status: 'paused' } as any)
      await loadCampaigns()
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
    try {
      await deleteCampaign(id as any)
      await loadCampaigns()
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
          <div className="card p-4 mb-4 text-error">{error}</div>
        )}

        <div className="grid gap-4">
          {campaigns.length === 0 && (
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
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-ghost"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
            <Plus className="w-4 h-4 mr-2" /> Criar Campanha
          </button>
        </div>
      </main>
    </div>
  )
}