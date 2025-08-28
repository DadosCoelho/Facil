// app/aposta/confirmacao/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, 
  Copy, 
  Download, 
  ArrowRight,
  Home,
  FileText
} from 'lucide-react'

interface Bet {
  id: string
  numbers: number[]
  shares: number
  createdAt: string
}

interface TransactionData {
  transactionId: string
  bets: Bet[]
  totalShares: number
  participantName: string
  campaignName: string
  createdAt: string
}

export default function ConfirmacaoPage({ params }: { params: { id: string } }) {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadTransactionData()
  }, [])

  const loadTransactionData = async () => {
    try {
      // Tentar carregar os dados da sessionStorage
      const storedDataString = sessionStorage.getItem('lastTransactionData')

      if (storedDataString) {
        const storedData = JSON.parse(storedDataString)
        // Verificar se o ID da transação corresponde ao da URL
        if (storedData.transactionId === params.id) {
          setTransactionData(storedData)
          setLoading(false)
          return
        }
      }

      // Se os dados não forem encontrados na sessionStorage ou não corresponderem,
      // significa que o usuário recarregou a página ou navegou diretamente.
      // Neste cenário, não temos como recuperar os detalhes da transação específica
      // (a menos que você implemente um endpoint backend para isso).
      setError('Os detalhes da sua aposta não puderam ser carregados diretamente. Por favor, use o link "Ver Minhas Apostas" para ver o histórico ou inicie uma nova aposta.');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao carregar os detalhes.')
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

  const downloadReceipt = () => {
    if (!transactionData) return

    const receipt = `
RECIBO DE APOSTAS - FACIL
========================

ID da Transação: ${transactionData.transactionId}
Data: ${new Date(transactionData.createdAt).toLocaleString('pt-BR')}
Participante: ${transactionData.participantName}
Campanha: ${transactionData.campaignName}

APOSTAS:
${transactionData.bets.map((bet, index) => `
${index + 1}. Números: ${bet.numbers.map(n => n.toString().padStart(2, '0')).join(' ')}
   Cotas: ${bet.shares}
`).join('')}

Total de Cotas: ${transactionData.totalShares}

Este documento confirma o registro de suas apostas no sistema Facil.
    `.trim()

    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo-${transactionData.transactionId}.txt`
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
          <p className="text-muted">Carregando confirmação...</p>
        </div>
      </div>
    )
  }

  if (error) { // Este bloco será mostrado se os dados não forem encontrados na sessão
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Não foi possível carregar os detalhes</h1>
          <p className="text-muted mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Opção para "Ver Minhas Apostas" */}
            <Link href="/minhas-apostas" className="btn btn-primary">
              Ver Minhas Apostas
            </Link>
            {/* Opção para "Voltar ao Início" */}
            <Link href="/" className="btn btn-ghost">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!transactionData) { 
    return null
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
          {/* Success Message */}
          <div className="card p-8 mb-8 text-center">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Apostas Confirmadas!</h1>
            <p className="text-muted text-lg mb-6">
              Suas apostas foram registradas com sucesso no sistema.
            </p>
            
            {/* Transaction ID */}
            <div className="bg-card-secondary p-4 rounded-lg mb-6">
              <p className="text-sm text-muted mb-2">ID da Transação</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono bg-background px-3 py-2 rounded">
                  {transactionData.transactionId}
                </code>
                <button
                  onClick={() => copyToClipboard(transactionData.transactionId)}
                  className="btn btn-ghost p-2"
                  title="Copiar ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-primary mt-2">Copiado!</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={downloadReceipt}
                className="btn btn-ghost flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Recibo
              </button>
              <Link
                href="/minhas-apostas"
                className="btn btn-primary flex items-center gap-2"
              >
                Ver Minhas Apostas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Transação</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted">Participante:</span>
                <span className="font-semibold">{transactionData.participantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Campanha:</span>
                <span className="font-semibold">{transactionData.campaignName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Data:</span>
                <span className="font-semibold">
                  {new Date(transactionData.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Total de Jogos:</span>
                <span className="font-semibold">{transactionData.bets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Total de Cotas:</span>
                <span className="font-bold text-primary text-lg">
                  {transactionData.totalShares}
                </span>
              </div>
            </div>
          </div>

          {/* Bets List */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Suas Apostas</h2>
            <div className="space-y-4">
              {transactionData.bets.map((bet, index) => (
                <div key={bet.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Jogo {index + 1}</span>
                    <span className="text-sm text-muted">
                      {bet.shares} cota{bet.shares > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bet.numbers.map((num) => (
                      <span
                        key={num}
                        className="w-8 h-8 rounded-lg text-sm flex items-center justify-center bg-primary/20 text-primary font-medium"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Próximos Passos</h3>
            <div className="space-y-3 text-sm text-muted">
              <p>• Guarde o ID da transação para referência futura</p>
              <p>• Suas apostas estão registradas no sistema</p>
              <p>• O organizador será notificado automaticamente</p>
              <p>• Você pode criar novas apostas usando o mesmo convite (se permitido)</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/" className="btn btn-ghost flex-1 py-4 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Link>
            <Link
              href="/minhas-apostas"
              className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-2"
            >
              Ver Minhas Apostas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}