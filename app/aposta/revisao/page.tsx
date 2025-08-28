// app/aposta/revisao/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Trash2, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Plus 
} from 'lucide-react'
import { Campaign } from '@/types/Campaign'; // NOVO: Importar Campaign type

interface Bet {
  id: string
  numbers: number[]
  shares: number
}

export default function RevisaoPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true) // Alterado para true
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false) 
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState<string>('')
  const [pricePerShare, setPricePerShare] = useState<number>(0)
  const [pixKey, setPixKey] = useState<string>('')
  const [pixInstructions, setPixInstructions] = useState<string>('')
  const [pixPaidConfirmed, setPixPaidConfirmed] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('inviteToken')
    const name = sessionStorage.getItem('participantName')
    const campaignId = sessionStorage.getItem('campaignId'); // NOVO: Pega o campaignId do sessionStorage

    if (!token) {
      router.push('/')
      return
    }

    const pendingBets = sessionStorage.getItem('pendingBets')
    if (pendingBets) {
      try {
        setBets(JSON.parse(pendingBets))
      } catch (e) {
        console.error('Erro ao carregar apostas da sessão:', e)
      }
    }

    setInviteToken(token)
    setParticipantName(name || '')

    // NOVO: Carregar configurações da campanha específica do convite
    if (campaignId) {
        fetch(`/api/invites/validate`, { // Revalida o token para pegar as config da campanha
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token }),
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.campaignDetails) {
                const campaignConfig: Campaign = data.campaignDetails; // Adapta para Campaign
                setPricePerShare(campaignConfig.pricePerShare ?? 0);
                setPixKey(campaignConfig.pixKey ?? '');
                setPixInstructions(campaignConfig.pixInstructions ?? '');
            } else {
                setError('Não foi possível carregar as configurações da campanha.');
            }
        })
        .catch(err => {
            console.error('Erro ao carregar configurações da campanha:', err);
            setError('Erro ao carregar configurações da campanha.');
        })
        .finally(() => setLoading(false)); // Finaliza o loading após tentar buscar as configs
    } else {
        setError('ID da campanha não encontrado na sessão.');
        setLoading(false); // Finaliza o loading com erro
    }
  }, [router])
  
  const removeBet = (betId: string) => {
    const newBets = bets.filter(bet => bet.id !== betId)
    setBets(newBets)
    sessionStorage.setItem('pendingBets', JSON.stringify(newBets))
  }

  const duplicateBet = (bet: Bet) => {
    const newBet: Bet = {
      ...bet,
      id: Date.now().toString()
    }
    const newBets = [...bets, newBet]
    setBets(newBets)
    sessionStorage.setItem('pendingBets', JSON.stringify(newBets))
  }

  const submitBets = async () => {
    if (bets.length === 0) {
      setError('Nenhuma aposta para enviar.')
      return
    }

    if (!pixPaidConfirmed) {
      setError('Você precisa confirmar que leu e pagou via PIX.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: inviteToken,
          bets: bets.map(bet => ({
            id: bet.id,
            numbers: bet.numbers,
            shares: bet.shares
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao enviar apostas.')
      }

      const result = await response.json() // { transactionId, status: 'processing', message: '...' }

      const fullTransactionData = {
        transactionId: result.transactionId,
        bets: bets, 
        totalShares: bets.reduce((sum, bet) => sum + bet.shares, 0),
        participantName: participantName, 
        campaignName: 'Lotofácil da Independência', // Idealmente viria da campanha
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem('lastTransactionData', JSON.stringify(fullTransactionData));
      sessionStorage.removeItem('pendingBets'); 

      setSuccess(true) 
      router.push(`/aposta/confirmacao/${result.transactionId}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar apostas.')
    } finally {
      setLoading(false)
    }
  }

  const addNewBet = () => {
    router.push('/aposta/nova')
  }

  if (loading) { // NOVO: Estado de loading inicial
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando configurações da campanha...</p>
        </div>
      </div>
    )
  }

  if (error && !inviteToken) { // Mostrar erro se não houver token ou erro grave no carregamento inicial
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="card p-8 max-w-md mx-auto text-center">
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Erro de Acesso</h1>
                <p className="text-muted mb-6">{error}</p>
                <Link href="/" className="btn btn-primary">Voltar ao Início</Link>
            </div>
        </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Apostas Enviadas!</h1>
          <p className="text-muted mb-6">
            Sua aposta está sendo processada e será confirmada em breve. Redirecionando...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
                {participantName && `Olá, ${participantName}`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Revisar e Enviar</h1>
            <p className="text-muted">Confirme suas apostas antes do envio final</p>
          </div>

          {bets.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Nenhuma aposta para revisar</h2>
              <p className="text-muted mb-6">
                Você ainda não criou nenhum jogo. Crie sua primeira aposta para continuar.
              </p>
              <button onClick={addNewBet} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Criar Primeira Aposta
              </button>
            </div>
          ) : (
            <>
              {/* Bets List */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Suas Apostas</h2>

                {bets.map((bet, index) => (
                  <div key={bet.id} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-semibold">Jogo #{bet.id.slice(-4)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicateBet(bet)}
                          className="btn btn-ghost text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => removeBet(bet.id)}
                          className="text-error hover:text-error/80"
                        >
                          <Trash2 className="w-4 h-4" />
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

              {/* Summary */}
              <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Total de jogos:</span>
                    <span className="font-semibold">{bets.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Total de cotas:</span>
                    <span className="font-bold text-primary text-lg">
                      {bets.reduce((sum, bet) => sum + bet.shares, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Valor total a pagar:</span>
                    <span className="font-bold text-primary text-lg">
                      R$ {(bets.reduce((sum, bet) => sum + bet.shares, 0) * pricePerShare).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PIX e Confirmação de Pagamento */}
              <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Pagamento via PIX</h3>
                <div className="space-y-3">
                  {pixInstructions && (
                    <p className="text-sm text-muted">{pixInstructions}</p>
                  )}
                  {pixKey && (
                    <div className="bg-card-secondary p-3 rounded">
                      <div className="text-xs text-muted mb-1">Chave/Payload PIX</div>
                      <code className="text-sm break-all block">{pixKey}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(pixKey)}
                        className="btn btn-ghost text-sm mt-2"
                      >
                        <Copy className="w-4 h-4 mr-1" /> Copiar PIX
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pixPaidConfirmed}
                        onChange={(e) => setPixPaidConfirmed(e.target.checked)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-sm">Confirmo que realizei o pagamento via PIX.</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-lg text-error mb-6">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={addNewBet}
                  className="btn btn-ghost flex-1 py-4"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Mais Jogos
                </button>
                <button
                  onClick={submitBets}
                  disabled={loading || bets.length === 0 || !pixPaidConfirmed}
                  className={`btn btn-primary flex-1 py-4 flex items-center justify-center gap-2 ${
                    (loading || bets.length === 0 || !pixPaidConfirmed) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Apostas
                    </>
                  )}
                </button>
              </div>

              {/* Warning */}
              <div className="mt-6 p-4 bg-warn/10 border border-warn/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warn mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warn mb-1">Atenção</p>
                    <p className="text-muted">
                      Após o envio, suas apostas serão registradas no sistema.
                      Verifique cuidadosamente todos os dados antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}