// app/aposta/nova/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Shuffle, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react'
import { Campaign } from '@/types/Campaign'; // NOVO: Importar Campaign type

interface Bet {
  id: string
  numbers: number[]
  shares: number
}

export default function NovaApostaPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [shares, setShares] = useState(1)
  const [bets, setBets] = useState<Bet[]>([])
  const [numbersPerBet, setNumbersPerBet] = useState<number>(15)
  const [pricePerShare, setPricePerShare] = useState<number>(0)
  const [loading, setLoading] = useState(true) // Alterado para true
  const [error, setError] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('inviteToken')
    const name = sessionStorage.getItem('participantName')
    const campaignId = sessionStorage.getItem('campaignId'); // NOVO: Pega o campaignId do sessionStorage
    
    if (!token) {
      router.push('/')
      return
    }
    
    setInviteToken(token)
    setParticipantName(name || '')

    // Carregar jogos já pendentes da sessão (se houver)
    const existingBets = sessionStorage.getItem('pendingBets')
    if (existingBets) {
      try {
        const parsed: Bet[] = JSON.parse(existingBets)
        if (Array.isArray(parsed)) {
          setBets(parsed)
        }
      } catch {}
    }

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
                setNumbersPerBet(campaignConfig.numbersPerBet ?? 15);
                setPricePerShare(campaignConfig.pricePerShare ?? 0);
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
  
  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number))
    } else if (selectedNumbers.length < numbersPerBet) {
      setSelectedNumbers([...selectedNumbers, number].sort((a, b) => a - b))
    }
  }
  
  const addBet = () => {
    if (selectedNumbers.length !== numbersPerBet) {
      setError(`Selecione exatamente ${numbersPerBet} números`)
      return
    }
    
    if (shares < 1) {
      setError('Quantidade de cotas deve ser pelo menos 1')
      return
    }

    const newBet: Bet = {
      id: Date.now().toString(),
      numbers: [...selectedNumbers],
      shares
    }

    const updated = [...bets, newBet]
    setBets(updated)
    try {
      sessionStorage.setItem('pendingBets', JSON.stringify(updated))
    } catch {}
    setSelectedNumbers([])
    setShares(1)
    setError(null)
  }

  const removeBet = (betId: string) => {
    setBets(bets.filter(bet => bet.id !== betId))
  }

  const generateRandomNumbers = () => {
    const numbers: number[] = []
    while (numbers.length < numbersPerBet) {
      const randomNum = Math.floor(Math.random() * 25) + 1
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum)
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b))
  }

  const clearNumbers = () => {
    setSelectedNumbers([])
  }

  const continueToReview = () => {
    if (bets.length === 0) {
      setError('Adicione pelo menos um jogo antes de continuar')
      return
    }
    
    sessionStorage.setItem('pendingBets', JSON.stringify(bets))
    router.push('/aposta/revisao')
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
            <h1 className="text-3xl font-bold">Criar Nova Aposta</h1>
            <p className="text-muted">Selecione seus números e defina as cotas</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Number Selection */}
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Seleção de Números</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateRandomNumbers}
                      className="btn btn-ghost text-sm"
                    >
                      <Shuffle className="w-4 h-4" />
                      Surpresinha
                    </button>
                    <button
                      onClick={clearNumbers}
                      className="btn btn-ghost text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Number Grid */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      className={`
                        w-12 h-12 rounded-lg border-2 font-semibold transition-all
                        ${selectedNumbers.includes(number)
                          ? 'bg-primary border-primary text-background'
                          : 'border-border hover:border-primary text-foreground'
                        }
                      `}
                    >
                      {number.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <span className="text-sm text-muted">
                    Selecionados: {selectedNumbers.length}/{numbersPerBet}
                  </span>
                  {selectedNumbers.length !== numbersPerBet && (
                    <p className="text-sm text-warn mt-1">
                      Selecione exatamente {numbersPerBet} números
                    </p>
                  )}
                </div>
              </div>

              {/* Shares Selection */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Quantidade de Cotas</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShares(Math.max(1, shares - 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-primary"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-20 text-center p-2 border border-border rounded-lg bg-card text-foreground"
                  />
                  <button
                    onClick={() => setShares(shares + 1)}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-primary"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-muted mt-2">
                  Valor por cota: R$ {pricePerShare.toFixed(2)}
                </p>
              </div>

              {/* Add Bet Button */}
              <button
                onClick={addBet}
                disabled={selectedNumbers.length !== numbersPerBet}
                className={`w-full btn btn-primary py-4 flex items-center justify-center gap-2 ${
                  selectedNumbers.length !== numbersPerBet ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-5 h-5" />
                Adicionar ao Resumo
              </button>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Current Bets Summary */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Jogos no Resumo</h2>
              
              {bets.length === 0 ? (
                <div className="card p-8 text-center text-muted">
                  <p>Nenhum jogo adicionado ainda</p>
                  <p className="text-sm mt-2">Selecione números e adicione ao resumo</p>
                </div>
              ) : (
                <>
                  {bets.map((bet) => (
                    <div key={bet.id} className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Jogo #{bet.id.slice(-4)}</span>
                        <button
                          onClick={() => removeBet(bet.id)}
                          className="text-error hover:text-error/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {bet.numbers.map((num) => (
                          <span
                            key={num}
                            className="w-6 h-6 rounded text-xs flex items-center justify-center bg-primary/20 text-primary font-medium"
                          >
                            {num.toString().padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">
                          {bet.numbers.length} números
                        </span>
                        <span className="font-semibold">
                          {bet.shares} cota{bet.shares > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="card p-4 bg-primary/10 border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">
                        {bets.reduce((sum, bet) => sum + bet.shares, 0)} cotas • R$ {(bets.reduce((sum, bet) => sum + bet.shares, 0) * pricePerShare).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={continueToReview}
                    className="w-full btn btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Continuar para Revisão
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}