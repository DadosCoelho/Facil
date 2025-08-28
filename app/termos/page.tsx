import Link from 'next/link'
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react'

export default function TermosPage() {
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="btn btn-ghost">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Termos de Uso</h1>
                <p className="text-muted">Última atualização: Dezembro 2024</p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted leading-relaxed">
                Ao acessar e usar a plataforma Facil, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </div>

            {/* Service Description */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted leading-relaxed mb-4">
                A Facil é uma plataforma web para gestão de apostas da Lotofácil da Independência, que permite:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li>Criação e gestão de campanhas de apostas</li>
                <li>Geração de convites individuais para participantes</li>
                <li>Seleção de números e definição de cotas</li>
                <li>Registro e acompanhamento de apostas</li>
                <li>Integração com Google Sheets para auditoria</li>
              </ul>
            </div>

            {/* User Responsibilities */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">3. Responsabilidades do Usuário</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Uso Responsável</h3>
                    <p className="text-muted text-sm">
                      Você é responsável por usar a plataforma de forma ética e em conformidade com as leis aplicáveis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Informações Verídicas</h3>
                    <p className="text-muted text-sm">
                      Todas as informações fornecidas devem ser verdadeiras, precisas e atualizadas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warn mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Não Compartilhamento</h3>
                    <p className="text-muted text-sm">
                      Não compartilhe seus convites ou credenciais de acesso com terceiros.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Betting Rules */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">4. Regras das Apostas</h2>
              <div className="space-y-4">
                <div className="bg-card-secondary p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Lotofácil da Independência</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                    <li>Selecione de 15 a 20 números do conjunto 1-25</li>
                    <li>Não são permitidos números repetidos</li>
                    <li>Cada jogo pode ter múltiplas cotas</li>
                    <li>As apostas são irreversíveis após confirmação</li>
                  </ul>
                </div>
                <p className="text-muted text-sm">
                  <strong>Importante:</strong> A Facil não é responsável pelos resultados dos sorteios ou pela 
                  distribuição de prêmios. Consulte as regras oficiais da loteria.
                </p>
              </div>
            </div>

            {/* Privacy and Data */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">5. Privacidade e Dados</h2>
              <p className="text-muted leading-relaxed mb-4">
                Sua privacidade é importante para nós. Coletamos apenas os dados necessários para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li>Gerenciar sua participação nas campanhas</li>
                <li>Registrar suas apostas e cotas</li>
                <li>Fornecer suporte e comunicação</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              <p className="text-muted text-sm mt-4">
                Para mais detalhes, consulte nossa{' '}
                <Link href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>

            {/* Prohibited Uses */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">6. Usos Proibidos</h2>
              <p className="text-muted leading-relaxed mb-4">
                É estritamente proibido:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li>Usar a plataforma para atividades ilegais</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento da plataforma</li>
                <li>Distribuir malware ou código malicioso</li>
                <li>Usar bots ou automação não autorizada</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">7. Propriedade Intelectual</h2>
              <p className="text-muted leading-relaxed">
                A plataforma Facil, incluindo seu design, funcionalidades e conteúdo, é protegida por direitos autorais 
                e outras leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir qualquer parte 
                da plataforma sem autorização expressa.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted leading-relaxed">
                A Facil não se responsabiliza por perdas, danos ou prejuízos decorrentes do uso da plataforma, 
                incluindo mas não se limitando a perdas financeiras relacionadas a apostas, interrupções do serviço 
                ou falhas técnicas.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">9. Alterações nos Termos</h2>
              <p className="text-muted leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                imediatamente após a publicação. É sua responsabilidade revisar periodicamente os termos para estar 
                ciente de quaisquer mudanças.
              </p>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
              <p className="text-muted leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do painel 
                administrativo ou entre em contato com o organizador da campanha.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-warn/10 border border-warn/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warn mt-0.5" />
                <div>
                  <h3 className="font-semibold text-warn mb-2">Aviso Legal</h3>
                  <p className="text-muted text-sm">
                    Este projeto é para fins educacionais/demonstrativos. A responsabilidade por conformidade legal 
                    e regulatória é do operador do sistema. Não constitui aconselhamento jurídico.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Link href="/" className="btn btn-primary">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
