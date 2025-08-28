import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react'

export default function PrivacidadePage() {
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
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Política de Privacidade</h1>
                <p className="text-muted">Última atualização: Dezembro 2024</p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted leading-relaxed">
                A Facil está comprometida em proteger sua privacidade e dados pessoais. Esta política descreve como 
                coletamos, usamos, armazenamos e protegemos suas informações quando você usa nossa plataforma.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">2. Informações que Coletamos</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Informações de Identificação</h3>
                    <p className="text-muted text-sm">
                      Nome ou apelido (opcional), token de convite único, identificador da campanha.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Dados das Apostas</h3>
                    <p className="text-muted text-sm">
                      Números selecionados, quantidade de cotas, data e hora de criação.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Dados de Uso</h3>
                    <p className="text-muted text-sm">
                      Timestamps de acesso, IP (hash), user-agent, ações na plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
              <p className="text-muted leading-relaxed mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li>Gerenciar sua participação nas campanhas de apostas</li>
                <li>Processar e registrar suas apostas</li>
                <li>Fornecer suporte técnico e atendimento</li>
                <li>Melhorar a funcionalidade da plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Prevenir fraudes e abusos</li>
              </ul>
            </div>

            {/* Data Storage and Security */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">4. Armazenamento e Segurança</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Segurança dos Dados</h3>
                    <p className="text-muted text-sm">
                      Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, 
                      incluindo criptografia, controle de acesso e monitoramento de segurança.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Local de Armazenamento</h3>
                    <p className="text-muted text-sm">
                      Seus dados são armazenados em servidores seguros da Vercel e Google Sheets, 
                      com proteções adequadas de segurança.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Retenção de Dados</h3>
                    <p className="text-muted text-sm">
                      Mantemos seus dados pelo tempo necessário para cumprir os propósitos descritos 
                      nesta política ou conforme exigido por lei.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-muted leading-relaxed mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li>Com o organizador da campanha (apenas dados das apostas)</li>
                <li>Com provedores de serviços que nos ajudam a operar a plataforma</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos, propriedade ou segurança</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">6. Seus Direitos</h2>
              <p className="text-muted leading-relaxed mb-4">
                Você tem os seguintes direitos relacionados aos seus dados pessoais:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li><strong>Acesso:</strong> Solicitar informações sobre os dados que temos sobre você</li>
                <li><strong>Correção:</strong> Solicitar correção de dados imprecisos ou incompletos</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              </ul>
            </div>

            {/* Cookies and Tracking */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">7. Cookies e Rastreamento</h2>
              <p className="text-muted leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da plataforma. Não utilizamos cookies 
                de rastreamento de terceiros ou tecnologias similares para monitorar seu comportamento 
                fora da plataforma.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">8. Serviços de Terceiros</h2>
              <p className="text-muted leading-relaxed mb-4">
                Nossa plataforma integra com os seguintes serviços:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                <li><strong>Google Sheets:</strong> Para armazenamento e auditoria das apostas</li>
                <li><strong>Vercel:</strong> Para hospedagem e infraestrutura da plataforma</li>
              </ul>
              <p className="text-muted text-sm mt-4">
                Esses serviços têm suas próprias políticas de privacidade, que recomendamos que você leia.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">9. Privacidade de Menores</h2>
              <p className="text-muted leading-relaxed">
                Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente 
                informações pessoais de menores. Se você é um pai ou responsável e acredita que seu filho 
                nos forneceu informações pessoais, entre em contato conosco.
              </p>
            </div>

            {/* International Transfers */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">10. Transferências Internacionais</h2>
              <p className="text-muted leading-relaxed">
                Suas informações podem ser transferidas e processadas em países diferentes do seu país de residência. 
                Garantimos que essas transferências sejam feitas de acordo com as leis de proteção de dados aplicáveis.
              </p>
            </div>

            {/* Changes to Privacy Policy */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">11. Alterações na Política</h2>
              <p className="text-muted leading-relaxed">
                Podemos atualizar esta política de privacidade periodicamente. Notificaremos você sobre 
                mudanças significativas através da plataforma ou por e-mail. Recomendamos que você revise 
                esta política regularmente.
              </p>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">12. Contato</h2>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted leading-relaxed mb-2">
                    Se você tiver dúvidas sobre esta política de privacidade ou sobre como tratamos seus dados, 
                    entre em contato conosco:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted ml-4">
                    <li>Através do painel administrativo da plataforma</li>
                    <li>Com o organizador da campanha</li>
                    <li>Por e-mail (se disponível)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Legal Basis */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">13. Base Legal</h2>
              <p className="text-muted leading-relaxed">
                Processamos seus dados pessoais com base em:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted ml-4 mt-2">
                <li><strong>Consentimento:</strong> Quando você aceita os termos de uso</li>
                <li><strong>Execução de Contrato:</strong> Para fornecer os serviços da plataforma</li>
                <li><strong>Interesse Legítimo:</strong> Para melhorar e proteger a plataforma</li>
                <li><strong>Obrigação Legal:</strong> Para cumprir requisitos legais</li>
              </ul>
            </div>

            {/* Data Protection Officer */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">14. Encarregado de Proteção de Dados</h2>
              <p className="text-muted leading-relaxed">
                Para questões relacionadas à proteção de dados e exercício de seus direitos, 
                você pode entrar em contato com o organizador da campanha, que atua como 
                encarregado de proteção de dados para esta plataforma.
              </p>
            </div>

            {/* Complaints */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">15. Reclamações</h2>
              <p className="text-muted leading-relaxed">
                Se você não estiver satisfeito com a forma como tratamos seus dados pessoais, 
                você tem o direito de apresentar uma reclamação à autoridade de proteção de dados 
                competente em seu país.
              </p>
            </div>

            {/* Effective Date */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="text-center">
                <h3 className="font-semibold text-primary mb-2">Data de Efetivação</h3>
                <p className="text-muted">
                  Esta política de privacidade entra em vigor em 1º de dezembro de 2024.
                </p>
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
