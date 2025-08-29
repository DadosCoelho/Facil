// Facil/app/minhas-apostas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, // Usado para o ícone do botão "Apostas da Campanha"
  Copy,
  Download,
  AlertCircle,
  Calendar,
  Hash
} from 'lucide-react'
import { Campaign } from '@/types/Campaign'; // Importação do tipo Campaign

interface Bet {
  id: string 
  numbers: number[] 
  shares: number
  createdAt: string
  status: 'active' | 'cancelled' | string
  campaignId: string;
  participantName?: string; // Esperado que venha da BetData agora
}

interface ParticipantData {
  inviteToken: string
  participantName: string
  campaignName: string
  totalBets: number
  totalShares: number
  campaignId: string; // Incluindo campaignId para o link
}

export default function MinhasApostasPage() {
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadParticipantData()
  }, [])

  const loadParticipantData = async () => {
    try {
      const token = sessionStorage.getItem('inviteToken')
      const name = sessionStorage.getItem('participantName')
      const inviteId = sessionStorage.getItem('inviteId'); 
      const campaignId = sessionStorage.getItem('campaignId'); 
      
      if (!token || !inviteId || !campaignId) {
        router.push('/')
        return
      }

      let fetchedCampaignName = 'Lotofácil da Independência'; 
      try {
          const campaignRes = await fetch(`/api/invites/validate`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token }),
          });
          if (campaignRes.ok) {
              const campaignData = await campaignRes.json();
              if (campaignData && campaignData.campaignDetails && campaignData.campaignDetails.name) {
                  fetchedCampaignName = campaignData.campaignDetails.name;
              }
          }
      } catch (campaignErr) {
          console.warn('Could not fetch campaign name from API:', campaignErr);
      }

      const response = await fetch(`/api/bets/by-invite-id`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inviteId: inviteId }),
      });

      if (!response.ok) {
          throw new Error('Falha ao carregar suas apostas.');
      }

      const data = await response.json(); 
      
      const loadedBets: Bet[] = data.bets.map((bet: any) => ({
          id: bet.id, 
          numbers: bet.numbers, 
          shares: bet.shares,
          createdAt: bet.createdAt,
          status: bet.status,
          campaignId: bet.campaignId,
          participantName: bet.participantName, // Garante que o nome seja lido do Firebase
      }));
      
      const participantInfo: ParticipantData = {
          inviteToken: token,
          participantName: name || 'Participante',
          campaignName: fetchedCampaignName, 
          totalBets: loadedBets.length,
          totalShares: loadedBets.reduce((sum: number, bet: Bet) => sum + bet.shares, 0),
          campaignId: campaignId, 
      }

      setParticipantData(participantInfo);
      setBets(loadedBets);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const downloadBetsReport = () => {
    if (!participantData || bets.length === 0) return

    const report = `
RELATÓRIO DE APOSTAS - FACIL
============================

Participante: ${participantData.participantName}
Campanha: ${participantData.campaignName}
Data do Relatório: ${new Date().toLocaleString('pt-BR')}

RESUMO:
- Total de Jogos: ${participantData.totalBets}
- Total de Cotas: ${participantData.totalShares}

APOSTAS:
${bets.map((bet, index) => `
${index + 1}. ID: ${bet.id}
   Data: ${new Date(bet.createdAt).toLocaleString('pt-BR')}
   Nome: ${bet.participantName || 'Desconhecido'}
   Números: ${bet.numbers.map(n => n.toString().padStart(2, '0')).join(' ')} 
   Cotas: ${bet.shares}
   Status: ${bet.status === 'active' ? 'Ativo' : bet.status}
`).join('')}

Este relatório foi gerado automaticamente pelo sistema Facil.
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minhas-apostas-${participantData.participantName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando suas apostas...</p>
        </div>
      </div>
    )
  }

  if (!participantData && !error) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted">Carregando dados do participante...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acesso Negado ou Erro</h1>
          <p className="text-muted mb-6">
            {error || 'Você precisa de um convite válido para acessar esta página.'}
          </p>
          <Link href="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
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
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                <span className="text-background font-bold text-lg">F</span>
              </div>
              <h1 className="text-xl font-bold">Facil</h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                Olá, {participantData?.participantName}
              </span>
              {/* REMOVIDO: Botão Nova Aposta do header */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            {/* NOVO: Botão "Apostas da Campanha" no lugar do "Voltar" */}
            {participantData?.campaignId && (
                <Link 
                    href={`/admin/campaign-bets-dashboard?campaignId=${participantData.campaignId}`} 
                    className="btn btn-ghost flex items-center justify-center gap-2"
                >
                    <FileText className="w-4 h-4" /> 
                    Apostas da Campanha
                </Link>
            )}
            
            <div>
              <h1 className="text-3xl font-bold">Minhas Apostas</h1>
              <p className="text-muted">Acompanhe todas as suas apostas na campanha</p>
            </div>
          </div>

          {/* Participant Info */}
          <div className="card p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Informações do Participante</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted" />
                    <span className="text-muted">Campanha:</span>
                    <span className="font-semibold">{participantData?.campaignName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <span className="text-muted">Data:</span>
                    <span className="font-semibold">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Total de Jogos:</span>
                    <span className="font-bold text-2xl text-primary">
                      {participantData?.totalBets}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Total de Cotas:</span>
                    <span className="font-bold text-2xl text-primary">
                      {participantData?.totalShares}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bets List */}
          {bets.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Nenhuma aposta encontrada</h2>
              <p className="text-muted mb-6">
                Você ainda não criou nenhuma aposta.
              </p>
              {/* REMOVIDO: Botão Criar Primeira Aposta */}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Suas Apostas</h2>
                <button
                  onClick={downloadBetsReport}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar Relatório
                </button>
              </div>

              <div className="space-y-4">
                {bets.map((bet, index) => (
                  <div key={bet.id} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-semibold">Jogo #{String(bet.id).slice(-4)}</span>
                          <div className="text-sm text-muted">
                            {new Date(bet.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${bet.status === 'active' ? 'ok' : 'err'}`}>
                          {bet.status === 'active' ? 'Ativo' : bet.status}
                        </span>
                        <button
                          onClick={() => copyToClipboard(String(bet.id))}
                          className="btn btn-ghost p-2"
                          title="Copiar ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {bet.numbers.map((num) => ( 
                        <span
                          key={num}
                          className="w-8 h-8 rounded-lg text-sm flex items-center justify-center bg-primary/20 text-primary font-medium"
                        >
                          {num.toString().padStart(2, '0')}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {bet.numbers.length} números selecionados 
                      </span>
                      <span className="font-semibold text-primary">
                        {bet.shares} cota{bet.shares > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {copied && (
                <div className="fixed bottom-4 right-4 bg-primary text-background px-4 py-2 rounded-lg shadow-lg">
                  ID copiado!
                </div>
              )}
            </>
          )}

          {/* REMOVIDO: Botão Criar Nova Aposta */}
          <div className="mt-8 text-center">
            <Link href="/" className="btn btn-primary">Voltar ao Início</Link>
          </div>
        </div>
      </main>
    </div>
  )
}