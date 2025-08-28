// types/Campaign.d.ts

export type CampaignStatus = 'active' | 'paused' | 'ended';

export interface Campaign {
  id: string; // ID único para a campanha (será gerado pelo Firebase ou UUID)
  name: string;
  description?: string;
  status: CampaignStatus;
  createdAt: string; // Data de criação (formato ISO string)
  updatedAt: string; // Data da última atualização (formato ISO string)

  // Regras de aposta para esta campanha específica
  pricePerShare: number; // Valor da cota (ex: R$ 3.50)
  numbersPerBet: number; // Quantidade de números por jogo (ex: 15 para Lotofácil)
  minSharesPerBet: number; // Mínimo de cotas permitidas por aposta (ex: 1)
  maxSharesPerBet?: number; // Máximo opcional de cotas por aposta

  // Informações de PIX para esta campanha
  pixKey?: string; // Chave PIX ou payload de copia e cola
  pixInstructions?: string; // Instruções adicionais para o pagamento PIX

  // Duração da campanha / janela de participação
  opensAt?: string; // Data/hora de abertura opcional (ISO string)
  closesAt?: string; // Data/hora de fechamento opcional (ISO string)

  // Outras configurações opcionais
  allowMultipleBetsPerInvite?: boolean; // Se um convite pode ser usado para múltiplas apostas
  singleUseInvitesDefault?: boolean; // Padrão para novos convites (uso único)
  inviteExpirationDaysDefault?: number; // Padrão de expiração para novos convites em dias
  
  // Configurações administrativas (ex: email do admin que criou)
  adminEmail?: string; 
}
