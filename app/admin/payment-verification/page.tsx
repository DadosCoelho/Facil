// Facil/app/admin/payment-verification/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BetData, PaymentStatus } from '@/lib/firebase-db'; // Importe BetData e PaymentStatus

export default function PaymentVerificationPage() {
  const [pendingBets, setPendingBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<{ betId: string | null; action: PaymentStatus | null }>({ betId: null, action: null });
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchPendingBets();
  }, [router]);

  const fetchPendingBets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/bets/pending', { // NOVO ENDPOINT DE API (você precisará criar ele ou adaptar a getBetsByPaymentStatus)
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminEmail');
          router.push('/admin/login');
          return;
        }
        throw new Error('Erro ao carregar apostas pendentes.');
      }

      const data: BetData[] = await response.json();
      setPendingBets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar apostas pendentes.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBetStatus = async (betId: string, status: PaymentStatus) => {
    setProcessing({ betId, action: status });
    setError(null);
    try {
      const response = await fetch('/api/admin/bets/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ betId, status }),
      });

      if (!response.ok) {
        // Resposta pode vir como HTML (página de erro) em casos de falha do servidor.
        // Tenta parsear JSON; se falhar, usa o texto cru como mensagem de erro.
        let errorMessage = `Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} aposta.`;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
          } else {
            const text = await response.text();
            // tenta extrair mensagem JSON caso o servidor tenha retornado JSON como texto
            try {
              const parsed = JSON.parse(text);
              errorMessage = parsed?.message || text || errorMessage;
            } catch {
              // resposta não é JSON, usa texto (pode ser HTML)
              // remove tags HTML se houver para mostrar uma mensagem curta
              errorMessage = text.replace(/<[^>]*>/g, '').trim().slice(0, 300) || errorMessage;
            }
          }
        } catch (e) {
          // fallback para mensagem padrão
        }
        throw new Error(errorMessage);
      }

      alert(`Aposta ${betId} ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      fetchPendingBets(); // Atualiza a lista de apostas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar aposta.');
    } finally {
      setProcessing({ betId: null, action: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando apostas pendentes...</p>
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
          <button onClick={fetchPendingBets} className="btn btn-primary">
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
          <h1 className="text-xl font-bold">Verificar Pagamentos</h1>
          <Link href="/admin" className="btn btn-ghost">← Voltar</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {pendingBets.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold">Nenhuma aposta pendente de verificação.</p>
            <p className="text-sm mt-2">Todas as apostas foram revisadas ou não há novas submissões.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Apostas Pendentes ({pendingBets.length})</h2>
            {pendingBets.map((bet) => (
              <div key={bet.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-warn" />
                    <span className="font-semibold text-lg">{bet.participantName}</span>
                    <span className="text-sm text-muted">- ID: {bet.id.substring(0, 8)}...</span>
                  </div>
                  <div className="text-muted text-sm mb-3">
                    Campanha: <span className="font-semibold text-foreground">{bet.campaignId}</span> | 
                    Data: {new Date(bet.createdAt).toLocaleString('pt-BR')}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {bet.numbers.map((num) => (
                      <span
                        key={num}
                        className="w-8 h-8 rounded-lg text-sm flex items-center justify-center bg-primary/20 text-primary font-medium"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  <div className="text-base">
                    <span className="font-semibold">{bet.shares} cota{bet.shares > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-40">
                  <button
                    type="button"
                    onClick={() => handleUpdateBetStatus(bet.id, 'approved')}
                    className="btn btn-primary flex items-center justify-center gap-2"
                    disabled={processing.betId === bet.id && processing.action !== null}
                  >
                    {processing.betId === bet.id && processing.action === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {processing.betId === bet.id && processing.action === 'approved' ? 'Aprovando...' : 'Aprovar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateBetStatus(bet.id, 'rejected')}
                    className="btn btn-danger flex items-center justify-center gap-2"
                    disabled={processing.betId === bet.id && processing.action !== null}
                  >
                    {processing.betId === bet.id && processing.action === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {processing.betId === bet.id && processing.action === 'rejected' ? 'Rejeitando...' : 'Rejeitar'}
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