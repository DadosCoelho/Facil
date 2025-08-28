// app/admin/campaigns/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { Campaign, CampaignStatus } from '@/types/Campaign';

export default function NewCampaignPage() {
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    status: 'active',
    pricePerShare: 3.5, // Valor padrão
    numbersPerBet: 15, // Valor padrão
    minSharesPerBet: 1, // Valor padrão
    singleUseInvitesDefault: true, // Valor padrão
    inviteExpirationDaysDefault: 7, // Valor padrão
    pixKey: '',
    pixInstructions: 'Envie o comprovante do PIX para confirmar sua participação.',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setCampaignData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      setCampaignData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setCampaignData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar campanha.');
      }

      const newCampaign: Campaign = await response.json();
      alert(`Campanha "${newCampaign.name}" criada com sucesso!`);
      router.push('/admin/campaigns'); // Volta para a lista de campanhas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao criar campanha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Nova Campanha</h1>
          <Link href="/admin/campaigns" className="btn btn-ghost">← Voltar para Campanhas</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome da Campanha <span className="text-error">*</span></label>
            <input type="text" id="name" name="name" value={campaignData.name || ''} onChange={handleChange} required className="w-full p-3 border border-border rounded-lg bg-card" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição</label>
            <textarea id="description" name="description" value={campaignData.description || ''} onChange={handleChange} rows={3} className="w-full p-3 border border-border rounded-lg bg-card"></textarea>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" name="status" value={campaignData.status || ''} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card">
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="ended">Encerrada</option>
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pricePerShare" className="block text-sm font-medium mb-1">Valor por Cota (R$) <span className="text-error">*</span></label>
              <input type="number" id="pricePerShare" name="pricePerShare" step="0.01" min="0" value={campaignData.pricePerShare || 0} onChange={handleChange} required className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
            <div>
              <label htmlFor="numbersPerBet" className="block text-sm font-medium mb-1">Números por Jogo <span className="text-error">*</span></label>
              <input type="number" id="numbersPerBet" name="numbersPerBet" min="15" max="20" value={campaignData.numbersPerBet || 0} onChange={handleChange} required className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minSharesPerBet" className="block text-sm font-medium mb-1">Mínimo de Cotas por Aposta</label>
              <input type="number" id="minSharesPerBet" name="minSharesPerBet" min="1" value={campaignData.minSharesPerBet || 1} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
            <div>
              <label htmlFor="maxSharesPerBet" className="block text-sm font-medium mb-1">Máximo de Cotas por Aposta (opcional)</label>
              <input type="number" id="maxSharesPerBet" name="maxSharesPerBet" value={campaignData.maxSharesPerBet || ''} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
          </div>
          <div>
            <label htmlFor="pixKey" className="block text-sm font-medium mb-1">Chave/Payload PIX</label>
            <textarea id="pixKey" name="pixKey" value={campaignData.pixKey || ''} onChange={handleChange} rows={3} className="w-full p-3 border border-border rounded-lg bg-card"></textarea>
          </div>
          <div>
            <label htmlFor="pixInstructions" className="block text-sm font-medium mb-1">Instruções PIX</label>
            <textarea id="pixInstructions" name="pixInstructions" value={campaignData.pixInstructions || ''} onChange={handleChange} rows={2} className="w-full p-3 border border-border rounded-lg bg-card"></textarea>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" id="singleUseInvitesDefault" name="singleUseInvitesDefault" checked={campaignData.singleUseInvitesDefault} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              Convites de uso único (padrão)
            </label>
            <div>
              <label htmlFor="inviteExpirationDaysDefault" className="block text-sm font-medium mb-1">Validade do convite (dias, padrão)</label>
              <input type="number" id="inviteExpirationDaysDefault" name="inviteExpirationDaysDefault" min="1" value={campaignData.inviteExpirationDaysDefault || 0} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button type="submit" disabled={saving} className={`w-full btn btn-primary py-3 flex items-center justify-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Campanha
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}