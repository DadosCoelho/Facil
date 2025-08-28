// facil/app/invite/[token]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface InviteData {
  campaignId: string
  campaignName: string
  expiresAt: string
  singleUse: boolean
  participant?: {
    name?: string
    email?: string
  }
  inviteId: string;
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [participantName, setParticipantName] = useState('')
  const router = useRouter()

  useEffect(() => {
    validateAndRedirectInvite()
  }, [])

  const validateAndRedirectInvite = async () => {
    try {
      const response = await fetch(`/api/invites/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: params.token }),
      })

      if (!response.ok) {
        throw new Error('Convite inválido ou expirado.')
      }

      const data: InviteData = await response.json()
      setInviteData(data)
      if (data?.participant?.name) {
        setParticipantName(data.participant.name)
      }

      // NOVO: Verificar se o convite já possui apostas registradas
      const checkStatusResponse = await fetch('/api/bets/check-invite-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: params.token }),
      });

      if (!checkStatusResponse.ok) {
          throw new Error('Não foi possível verificar o status do convite.');
      }

      const { hasBets } = await checkStatusResponse.json();

      if (hasBets) {
        // MUITO IMPORTANTE: Popular o sessionStorage ANTES de redirecionar
        // Isso garante que 'minhas-apostas' tenha os dados para buscar as apostas no Firebase
        sessionStorage.setItem('inviteToken', params.token);
        sessionStorage.setItem('inviteId', data.inviteId);
        sessionStorage.setItem('participantName', data.participant?.name || '');
        sessionStorage.setItem('campaignId', data.campaignId); // Opcional, se 'minhas-apostas' precisar da campanha

        // Se já houver apostas, redireciona para "Minhas Apostas"
        router.push('/minhas-apostas');
        setLoading(false); // Definir loading como false aqui para não mostrar tela vazia antes do redirect
      } else {
        // Se não houver apostas, permite que o usuário prossiga para criar novas
        setLoading(false); // Apenas define loading como false se não redirecionar
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar convite.')
      setLoading(false)
    }
  }

  const handleStart = () => {
    if (!acceptedTerms) return

    // Salvar dados da sessão (necessário para novos usuários que não tinham apostas prévias)
    sessionStorage.setItem('inviteToken', params.token)
    sessionStorage.setItem('participantName', participantName)
    sessionStorage.setItem('campaignId', inviteData?.campaignId || '')
    sessionStorage.setItem('inviteId', inviteData?.inviteId || ''); // Garantir que inviteId seja salvo aqui também

    // Redirecionar para criação de aposta
    router.push('/aposta/nova')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Validando convite e verificando apostas existentes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Convite Inválido</h1>
          <p className="text-muted mb-6">{error}</p>
          <p className="text-sm text-muted mb-6">
            Entre em contato com o organizador para obter um novo convite.
          </p>
          <Link href="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  if (!inviteData) {
    return null // Não renderiza nada enquanto os dados não estiverem disponíveis
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <span className="text-background font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold">Facil</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Campaign Info */}
          <div className="card p-8 mb-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Convite Válido!</h1>
              <p className="text-muted">Bem-vindo à campanha</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-card-secondary rounded-lg">
                <span className="text-muted">Campanha:</span>
                <span className="font-semibold">{inviteData.campaignName}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-card-secondary rounded-lg">
                <span className="text-muted">Validade:</span>
                <span className="font-semibold">
                  {new Date(inviteData.expiresAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {inviteData.singleUse && (
                <div className="flex items-center justify-between p-4 bg-card-secondary rounded-lg">
                  <span className="text-muted">Tipo:</span>
                  <span className="badge warn">Uso Único</span>
                </div>
              )}
            </div>

            {/* Participant Info */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Seu Nome (opcional)
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Digite seu nome ou apelido"
                className="w-full p-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Terms */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm">
                  Li e aceito os{' '}
                  <Link href="/termos" className="text-primary hover:underline">
                    termos de uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" className="text-primary hover:underline">
                    política de privacidade
                  </Link>
                </span>
              </label>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!acceptedTerms}
              className={`w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-2 ${
                !acceptedTerms ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Começar a Apostar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Como Funciona:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Selecione de 15 a 20 números (1-25)</li>
              <li>Defina a quantidade de cotas para cada jogo</li>
              <li>Revise e confirme suas apostas</li>
              <li>Receba confirmação do envio</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}