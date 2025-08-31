// Facil/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Gift, Settings, LogOut, Loader2, AlertCircle } from 'lucide-react';
// Não precisamos mais importar 'Campaign' aqui se não vamos carregar a lista completa
// import { Campaign } from '@/types/Campaign'; 

export default function AdminDashboardPage() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  // selectedCampaignId agora será populado apenas do sessionStorage na inicialização
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // O loading agora é apenas para a verificação inicial
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    const email = sessionStorage.getItem('adminEmail');
    const storedSelectedCampaignId = sessionStorage.getItem('selectedCampaignId');

    if (!token || !email) {
      router.push('/admin/login');
      return;
    }
    setAdminEmail(email);

    if (!storedSelectedCampaignId) {
      // Se nenhuma campanha estiver selecionada, redireciona para a página de seleção de campanhas
      alert('Nenhuma campanha selecionada. Por favor, selecione uma campanha.');
      router.push('/admin/campaigns');
      return;
    }
    
    // Se há uma campanha selecionada, define no estado e finaliza o loading
    setSelectedCampaignId(storedSelectedCampaignId);
    setLoading(false);

  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('selectedCampaignId'); // Limpa a campanha selecionada ao deslogar
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // Se selectedCampaignId for nulo após o loading (o que não deve acontecer se a lógica de redirecionamento funcionar)
  if (!selectedCampaignId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erro de Configuração</h1>
          <p className="text-muted mb-6">Nenhuma campanha foi selecionada. Redirecionando...</p>
          {/* Pode adicionar um pequeno delay e depois forçar o redirect se necessário,
              mas o useEffect já deve ter feito isso. */}
          <Link href="/admin/campaigns" className="btn btn-primary">
            Selecionar Campanha
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden md:block">Logado como: {adminEmail}</span>
            <button onClick={handleLogout} className="btn btn-ghost">
              <LogOut className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {/* Removemos o seletor de campanha aqui */}
        {/* Agora, os links assumem que selectedCampaignId está disponível */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Todos os links agora usam o selectedCampaignId do estado */}
          <Link href={`/admin/campaign-bets-dashboard?campaignId=${selectedCampaignId}`} className="card p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <LayoutDashboard className="w-12 h-12 text-primary mb-3" />
            <h2 className="text-xl font-semibold mb-2">Dashboard da Campanha</h2>
            <p className="text-muted text-sm">Visualizar relatórios e estatísticas da campanha.</p>
          </Link>

          {/* As páginas de convites e verificação de pagamentos já buscam o selectedCampaignId do sessionStorage */}
          <Link href="/admin/convites" className="card p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <Users className="w-12 h-12 text-primary mb-3" />
            <h2 className="text-xl font-semibold mb-2">Gerar Convites</h2>
            <p className="text-muted text-sm">Criar e gerenciar links de convite para participantes.</p>
          </Link>

          <Link href="/admin/payment-verification" className="card p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <CreditCard className="w-12 h-12 text-primary mb-3" />
            <h2 className="text-xl font-semibold mb-2">Verificar Pagamentos</h2>
            <p className="text-muted text-sm">Aprovar ou rejeitar apostas pendentes.</p>
          </Link>

          <Link href="/admin/campaigns" className="card p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <Gift className="w-12 h-12 text-primary mb-3" />
            <h2 className="text-xl font-semibold mb-2">Gerenciar Campanhas</h2>
            <p className="text-muted text-sm">Adicionar, editar ou remover campanhas.</p>
          </Link>

          {/* A página de configurações da campanha também busca o selectedCampaignId do sessionStorage */}
          <Link href="/admin/configuracoes" className="card p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <Settings className="w-12 h-12 text-primary mb-3" />
            <h2 className="text-xl font-semibold mb-2">Configurações da Campanha</h2>
            <p className="text-muted text-sm">Ajustar regras e detalhes da campanha selecionada.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}