// Facil/app/admin/campaign-bets-dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, BarChart3, Users, TrendingUp, ArrowLeft } from 'lucide-react';

interface Bet {
  id: string;
  numbers: number[];
  shares: number;
  createdAt: string;
  status: string;
  participantName?: string;
  // =========================================================
  // CORREÇÃO: Adicionando a propriedade inviteId
  // =========================================================
  inviteId: string; 
}

interface CampaignBetsData {
  campaignId: string;
  campaignName: string;
  totalBets: number;
  totalShares: number;
  bets: Bet[];
}

export default function CampaignBetsDashboardPage() {
  const [data, setData] = useState<CampaignBetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const campaignIdFromUrl = searchParams.get('campaignId');
    const campaignIdFromSession = sessionStorage.getItem('campaignId');

    let targetCampaignId = campaignIdFromUrl || campaignIdFromSession;

    if (!targetCampaignId && sessionStorage.getItem('adminToken')) {
        targetCampaignId = sessionStorage.getItem('selectedCampaignId');
    }

    if (!targetCampaignId) {
        setError('Nenhuma campanha especificada ou ativa para exibir as apostas.');
        setLoading(false);
        return;
    }

    const fetchBetsData = async (campaignId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/campaign-bets?campaignId=${campaignId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados das apostas da campanha.');
        }
        const result: CampaignBetsData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchBetsData(targetCampaignId);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
          <Loader2 className="w-12 h-12 border-b-2 border-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted">Carregando dados da campanha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-error" />
          <h1 className="mb-4 text-2xl font-bold">Erro ao Carregar Dashboard</h1>
          <p className="mb-6 text-muted">{error}</p>
          <Link href="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Botão de voltar, condicional para admin ou participante */}
          {sessionStorage.getItem('adminToken') ? (
             <Link href="/admin" className="btn btn-ghost p-2">
                <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <Link href="/minhas-apostas" className="btn btn-ghost p-2">
                <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          
          {/* Título centralizado, ocupando o espaço restante */}
          <h1 className="flex-1 text-center text-xl font-bold">Dashboard da Campanha: {data.campaignName}</h1>
          {/* Placeholder invisível para balancear o botão de voltar e manter o título centralizado */}
          <div className="w-[36px]"></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">Total de Apostas</p>
                <p className="text-2xl font-bold">{data.totalBets}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">Total de Cotas</p>
                <p className="text-2xl font-bold">{data.totalShares}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Lista de Apostas</h2>
          {data.bets.length === 0 ? (
            <p className="text-muted">Nenhuma aposta registrada para esta campanha ainda.</p>
          ) : (
            <div className="space-y-4">
              {data.bets.map((bet, index) => (
                <div key={bet.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">
                      {/* CORREÇÃO: Usando a propriedade inviteId agora disponível */}
                      {bet.participantName || `Participante ${bet.inviteId.substring(0, 4)}...`}
                    </span>
                    <span className="text-sm text-muted">
                      {new Date(bet.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {bet.numbers.map((num) => (
                      <span
                        key={num}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-medium text-primary"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted">
                    {bet.shares} cota{bet.shares > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          {sessionStorage.getItem('adminToken') ? (
             <Link href="/admin" className="btn btn-primary flex justify-center">Voltar para o Painel Admin</Link>
          ) : (
            <Link href="/minhas-apostas" className="btn btn-primary flex justify-center">Voltar para Minhas Apostas</Link>
          )}
        </div>
      </main>
    </div>
  );
}