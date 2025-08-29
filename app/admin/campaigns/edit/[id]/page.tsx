// Facil/app/admin/campaigns/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader2, AlertCircle } from 'lucide-react'; 
import { Campaign, CampaignStatus } from '@/types/Campaign';

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  const { id: campaignId } = params;
  const [campaignData, setCampaignData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadCampaign();
  }, [router, campaignId]);

  const loadCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Campanha não encontrada ou erro ao carregar.');
      }
      const data: Campaign = await response.json();
      // Armazena a string ISO diretamente no estado
      setCampaignData(data); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar campanha.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (campaignData) {
      if (type === 'number') {
        setCampaignData(prev => ({ ...prev!, [name]: parseFloat(value) || 0 }));
      } else if (type === 'checkbox') {
        setCampaignData(prev => ({ ...prev!, [name]: (e.target as HTMLInputElement).checked }));
      } else if (name === 'closesAt') {
        // Converte YYYY-MM-DD do input para string ISO para o estado
        // Adicionando 'T00:00:00' para garantir interpretação consistente de fuso horário
        setCampaignData(prev => ({
          ...prev!,
          [name]: value ? new Date(value + 'T00:00:00').toISOString() : undefined // Usa undefined se vazio
        }));
      }
      else {
        setCampaignData(prev => ({ ...prev!, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignData) return;

    setSaving(true);
    setError(null);

    const dataToSubmit = { ...campaignData };
    // Se closesAt for vazio ou undefined, garante que seja undefined para a API
    if (!dataToSubmit.closesAt || dataToSubmit.closesAt === '') {
        dataToSubmit.closesAt = undefined; 
    }

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(dataToSubmit), // Usa os dados preparados
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar campanha.');
      }

      const updatedCampaign: Campaign = await response.json();
      // Armazena a string ISO retornada diretamente no estado
      setCampaignData(updatedCampaign); 
      alert(`Campanha "${updatedCampaign.name}" atualizada com sucesso!`);
      router.push('/admin/campaigns'); // Volta para a lista de campanhas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar campanha.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erro ao Carregar</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link href="/admin/campaigns" className="btn btn-primary">
            Voltar para Campanhas
          </Link>
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        {/* Cabeçalho centralizado */}
        <div className="container mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-bold">
            Editar Campanha: {campaignData.name}
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div>
            <label htmlFor="id" className="block text-sm font-medium mb-1">ID da Campanha</label>
            <input type="text" id="id" name="id" value={campaignData.id} disabled className="w-full p-3 border border-border rounded-lg bg-card cursor-not-allowed opacity-70" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome da Campanha <span className="text-error">*</span></label>
            <input type="text" id="name" name="name" value={campaignData.name || ''} onChange={handleChange} required className="w-full p-3 border border-border rounded-lg bg-card" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" name="status" value={campaignData.status || ''} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card">
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="ended">Encerrada</option>
            </select>
          </div>
          {/* Validade da Campanha (Data de Fechamento) */}
          <div>
            <label htmlFor="closesAt" className="block text-sm font-medium mb-1">Validade da Campanha (Data de Fechamento)</label>
            <input 
              type="date" 
              id="closesAt" 
              name="closesAt" 
              // Converte a string ISO do estado para YYYY-MM-DD para o valor do input
              value={campaignData.closesAt ? new Date(campaignData.closesAt).toISOString().split('T')[0] : ''} 
              onChange={handleChange} 
              className="w-full p-3 border border-border rounded-lg bg-card" 
            />
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
          <div>
            <label htmlFor="pixKey" className="block text-sm font-medium mb-1">Chave/Payload PIX</label>
            <textarea id="pixKey" name="pixKey" value={campaignData.pixKey || ''} onChange={handleChange} rows={3} className="w-full p-3 border border-border rounded-lg bg-card"></textarea>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" id="singleUseInvitesDefault" name="singleUseInvitesDefault" checked={campaignData.singleUseInvitesDefault} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              Convites de uso único (padrão)
            </label>
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
                Salvar Alterações
              </>
            )}
          </button>
          
          <Link href="/admin/campaigns" className="w-full btn btn-ghost py-3 mt-4 flex justify-center">
            Voltar para Campanhas
          </Link>

        </form>
      </main>
    </div>
  );
}