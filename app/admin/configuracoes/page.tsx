// app/admin/configuracoes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Campaign, CampaignStatus } from '@/types/Campaign'; // NOVO: Importar Campaign type
import { AlertCircle } from 'lucide-react'; // Certifique-se de importar AlertCircle

type Config = Campaign; // Usa Campaign diretamente como o tipo para config

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null); // NOVO
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken')
    const email = sessionStorage.getItem('adminEmail')
    const storedSelectedCampaignId = sessionStorage.getItem('selectedCampaignId'); // Pega o ID da campanha selecionada

    if (!token || !email) {
      router.push('/admin/login');
      return;
    }
    if (!storedSelectedCampaignId) { // Garante que uma campanha esteja selecionada
        alert('Nenhuma campanha selecionada. Por favor, selecione uma campanha.');
        router.push('/admin/campaigns');
        return;
    }
    setSelectedCampaignId(storedSelectedCampaignId);
    loadConfig(storedSelectedCampaignId); // Passa o ID da campanha selecionada
  }, [router]);

  async function loadConfig(campaignId: string) { // Agora aceita campaignId
    const res = await fetch(`/api/admin/config?campaignId=${campaignId}`, { // Passa campaignId
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        }
    });
    if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Falha ao carregar configuração da campanha.');
        return;
    }
    const data = await res.json();
    setConfig(data);
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!config || !selectedCampaignId) return // Garante que config e ID estão presentes
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/config?campaignId=${selectedCampaignId}`, { // Passa campaignId
        method: 'POST', // Usa POST para atualização, ou PUT se preferir REST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Falha ao salvar configuração')
      }
      const updated = await res.json()
      setConfig(updated)
      alert('Configurações da campanha salvas com sucesso!');
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Configurações da Campanha {config?.name ? `: ${config.name}` : ''}</h1>
          <Link href="/admin" className="btn btn-ghost">← Voltar</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!config ? (
          <div className="card p-6">
            {error ? (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            ) : (
                'Carregando…'
            )}
            </div>
        ) : (
          <form onSubmit={saveConfig} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm mb-1">ID da campanha</label>
              <input value={config.id} disabled className="w-full p-3 border border-border rounded-lg bg-card cursor-not-allowed opacity-70" />
            </div>
            <div>
              <label className="block text-sm mb-1">Nome da campanha</label>
              <input name="name" value={config.name||''} onChange={(e)=>setConfig({...config!, name: e.target.value})} className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select name="status" value={config.status} onChange={(e)=>setConfig({...config!, status: e.target.value as CampaignStatus})} className="w-full p-3 border border-border rounded-lg bg-card">
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="ended">Encerrada</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Valor por cota (R$)</label>
                <input type="number" name="pricePerShare" step="0.01" min="0" value={config.pricePerShare} onChange={(e)=>setConfig({...config!, pricePerShare: parseFloat(e.target.value||'0')||0})} className="w-full p-3 border border-border rounded-lg bg-card" />
              </div>
              <div>
                <label className="block text-sm mb-1">Números por jogo</label>
                <input type="number" name="numbersPerBet" min={15} max={20} value={config.numbersPerBet} onChange={(e)=>setConfig({...config!, numbersPerBet: Math.min(20, Math.max(15, parseInt(e.target.value||'15',10)))})} className="w-full p-3 border border-border rounded-lg bg-card" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">PIX (chave ou payload copia e cola)</label>
              <textarea name="pixKey" value={config.pixKey||''} onChange={(e)=>setConfig({...config!, pixKey: e.target.value})} className="w-full p-3 border border-border rounded-lg bg-card" rows={3} />
            </div>
            <div>
              <label className="block text-sm mb-1">Instruções do PIX</label>
              <textarea name="pixInstructions" value={config.pixInstructions||''} onChange={(e)=>setConfig({...config!, pixInstructions: e.target.value})} className="w-full p-3 border border-border rounded-lg bg-card" rows={2} />
            </div>
            <div className="text-sm text-muted">Última atualização: {new Date(config.updatedAt).toLocaleString('pt-BR')}</div>
            <button type="submit" disabled={saving} className={`btn btn-primary ${saving?'opacity-50 cursor-not-allowed':''}`}>{saving?'Salvando…':'Salvar'}</button>
            {error && <div className="text-error text-sm">{error}</div>}
          </form>
        )}
      </main>
    </div>
  )
}