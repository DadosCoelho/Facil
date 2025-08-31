// Facil/app/admin/payment-verification/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
// Importe a nova interface InviteGroupData e os tipos BetData, PaymentStatus
import { BetData, PaymentStatus, InviteGroupData } from '@/lib/firebase-db'; 

export default function PaymentVerificationPage() {
  // NOVO ESTADO: Armazena grupos de convites pendentes
  const [pendingInviteGroups, setPendingInviteGroups] = useState<InviteGroupData[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // NOVO ESTADO: 'processing' agora monitora o inviteId que está sendo processado
  const [processing, setProcessing] = useState<{ inviteId: string | null; action: PaymentStatus | null }>({ inviteId: null, action: null });
  const router = useRouter();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    const storedSelectedCampaignId = sessionStorage.getItem('selectedCampaignId'); // Obtém a campanha selecionada

    if (!token) {
      router.push('/admin/login');
      return;
    }
    // Garante que uma campanha esteja selecionada para exibir os pagamentos
    if (!storedSelectedCampaignId) {
        alert('Nenhuma campanha selecionada. Por favor, selecione uma campanha.');
        router.push('/admin/campaigns'); // Redireciona para a seleção de campanha se nenhuma for ativa
        return;
    }
    setSelectedCampaignId(storedSelectedCampaignId);

    // Chama a função de busca com o ID da campanha selecionada
    fetchPendingInviteGroups(storedSelectedCampaignId);
  }, [router]); // Dependência do router para garantir que o efeito rode após redirecionamentos

  // NOVO: Função para buscar grupos de convites pendentes filtrados por campanha
  const fetchPendingInviteGroups = async (campaignId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Faz a requisição para a API, passando o campaignId
      const response = await fetch(`/api/admin/bets/pending?campaignId=${campaignId}`, { 
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        // Lida com a autenticação expirada ou inválida
        if (response.status === 401) {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminEmail');
          sessionStorage.removeItem('selectedCampaignId');
          router.push('/admin/login');
          return;
        }
        throw new Error('Erro ao carregar convites pendentes.');
      }

      // A API agora retorna uma lista de InviteGroupData
      const data: InviteGroupData[] = await response.json(); 
      setPendingInviteGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar convites pendentes.');
    } finally {
      setLoading(false);
    }
  };

  // NOVO: Função para atualizar o status de um convite completo (todas as suas apostas)
  const handleUpdateInviteStatus = async (inviteId: string, status: PaymentStatus) => {
    setProcessing({ inviteId, action: status }); // Define o estado de processamento para o convite específico
    setError(null);
    try {
      const response = await fetch('/api/admin/bets/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
        // Envia o inviteId e o status para a API
        body: JSON.stringify({ inviteId, status }), 
      });

      if (!response.ok) {
        let errorMessage = `Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} convite.`;
        // Lógica aprimorada para extrair mensagem de erro da resposta da API
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
          } else {
            const text = await response.text();
            try {
              const parsed = JSON.parse(text);
              errorMessage = parsed?.message || text || errorMessage;
            } catch {
              errorMessage = text.replace(/<[^>]*>/g, '').trim().slice(0, 300) || errorMessage;
            }
          }
        } catch (e) {
          // fallback para mensagem padrão se o parse falhar
        }
        throw new Error(errorMessage);
      }

      alert(`Convite ${inviteId} ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      // Recarrega os dados para atualizar a lista após a operação, usando o ID da campanha selecionada
      selectedCampaignId && fetchPendingInviteGroups(selectedCampaignId); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar convite.');
    } finally {
      setProcessing({ inviteId: null, action: null }); // Limpa o estado de processamento
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando convites pendentes da campanha...</p>
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
          <button onClick={() => selectedCampaignId && fetchPendingInviteGroups(selectedCampaignId)} className="btn btn-primary">
            Tentar Novamente
          </button>
          <div className="mt-4">
            <Link href="/admin" className="btn btn-ghost">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Exibe o ID da campanha para clareza */}
          <h1 className="text-xl font-bold">Verificar Pagamentos (Campanha: {selectedCampaignId})</h1>
          <Link href="/admin" className="btn btn-ghost">← Voltar</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {pendingInviteGroups.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold">Nenhum convite pendente de verificação para esta campanha.</p>
            <p className="text-sm mt-2">Todas as apostas foram revisadas ou não há novas submissões pendentes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Convites Pendentes ({pendingInviteGroups.length})</h2>
            {pendingInviteGroups.map((group) => (
              <div key={group.inviteId} className="card p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-warn" />
                    <span className="font-semibold text-lg">{group.participantName}</span>
                    <span className="text-sm text-muted">- Convite ID: {group.inviteId.substring(0, 8)}...</span>
                  </div>
                  <div className="text-muted text-sm mb-3">
                    Campanha: <span className="font-semibold text-foreground">{group.campaignId}</span> | 
                    Data do Primeiro Jogo: {new Date(group.firstBetCreatedAt).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-base font-semibold mb-2">
                    Total de {group.bets.length} jogo{group.bets.length > 1 ? 's' : ''}, somando {group.totalShares} cota{group.totalShares > 1 ? 's' : ''}.
                  </p>
                  <div className="space-y-2">
                    {group.bets.map(bet => (
                      <div key={bet.id} className="border border-border rounded-md p-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">Jogo ID: {bet.id.substring(0, 8)}...</span>
                          <span className="text-muted">{bet.shares} cota{bet.shares > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bet.numbers.map(num => (
                            <span key={num} className="w-7 h-7 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                              {num.toString().padStart(2, '0')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-40">
                  <button
                    type="button"
                    onClick={() => handleUpdateInviteStatus(group.inviteId, 'approved')}
                    className="btn btn-primary flex items-center justify-center gap-2"
                    // Desabilita se este convite já estiver sendo processado
                    disabled={processing.inviteId === group.inviteId && processing.action !== null}
                  >
                    {processing.inviteId === group.inviteId && processing.action === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {processing.inviteId === group.inviteId && processing.action === 'approved' ? 'Aprovando...' : 'Aprovar Convite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateInviteStatus(group.inviteId, 'rejected')}
                    className="btn btn-danger flex items-center justify-center gap-2"
                    // Desabilita se este convite já estiver sendo processado
                    disabled={processing.inviteId === group.inviteId && processing.action !== null}
                  >
                    {processing.inviteId === group.inviteId && processing.action === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {processing.inviteId === group.inviteId && processing.action === 'rejected' ? 'Rejeitando...' : 'Rejeitar Convite'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}