// Facil/lib/firebase-db.ts
// Conteúdo:

// IMPORTANTE: Este arquivo DEVE SER IMPORTADO SOMENTE POR CÓDIGOS DE BACKEND (API Routes, Server Components)
// NUNCA importe este arquivo diretamente em componentes React de cliente (com 'use client').

import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';
import { Database as AdminDatabaseType, DataSnapshot as AdminDataSnapshot, Query as AdminQueryType } from 'firebase-admin/database';
import { Campaign, CampaignStatus } from '@/types/Campaign';

let initializedAdminDatabase: AdminDatabaseType | undefined;

// Cache for campaigns to avoid frequent full reads from Realtime Database.
// TTL can be configured via environment variable CAMPAIGNS_CACHE_TTL_MS (milliseconds).
const CAMPAIGNS_CACHE_TTL_MS = Number(process.env.CAMPAIGNS_CACHE_TTL_MS) || 30_000; // default 30s
let campaignsCache: { data: Campaign[]; fetchedAt: number } | null = null;

// Função interna para obter a instância do Admin Database
function getAdminDatabaseInstance(): AdminDatabaseType {
  // Se já inicializado, retorna a instância existente
  if (initializedAdminDatabase) {
    return initializedAdminDatabase;
  }

  // Verifica se FIREBASE_ADMIN_SDK_CONFIG está disponível
  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG) {
    throw new Error("FIREBASE_ADMIN_SDK_CONFIG não definido. Firebase Admin SDK não pode ser inicializado.");
  }

  try {
    // Parseia a string JSON da variável de ambiente
    const serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG as string);
    
    // Extrai o projectId corretamente do JSON (usa "project_id" em snake_case)
    const projectId = serviceAccountJson.project_id;
    if (!projectId) {
        throw new Error("Firebase project_id está faltando na configuração da conta de serviço.");
    }

    let appToUse: admin.app.App; 
  
  // Tenta obter uma instância existente ou inicializa uma nova
  if (admin.apps.some(app => app?.name === 'adminServerApp')) {
    appToUse = admin.app('adminServerApp');
  } else {
    // Determine a URL do Realtime Database a usar:
    // 1) Use a variável de ambiente FIREBASE_DATABASE_URL quando disponível (recomendado)
    // 2) Caso contrário, use o padrão "{projectId}-default-rtdb.firebaseio.com" (novo padrão de RTDB)
    // 3) Por compatibilidade, também aceitaremos "{projectId}.firebaseio.com" se necessário
    const envDbUrl = process.env.FIREBASE_DATABASE_URL && process.env.FIREBASE_DATABASE_URL.trim();
    const candidate1 = envDbUrl || `https://${projectId}-default-rtdb.firebaseio.com`;
    const candidate2 = `https://${projectId}.firebaseio.com`;
    // Prefer candidate1 (env or -default-rtdb), but log both for debugging
    const chosenDbUrl = candidate1;

    console.log(`Initializing Firebase Admin with databaseURL: ${chosenDbUrl} (alt: ${candidate2})`);

    appToUse = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
      databaseURL: chosenDbUrl
    }, 'adminServerApp');
  }

    // Como 'appToUse' foi declarada sem '| undefined' e é atribuída em ambas as branches
    // do if/else, TypeScript deve estar convencido de que é um 'admin.app.App' válido aqui.
    initializedAdminDatabase = appToUse.database(); 
    console.log("Firebase Admin SDK inicializado para backend via firebase-db.ts.");
    return initializedAdminDatabase;

  } catch (e) {
    console.error("Erro ao inicializar Firebase Admin SDK em firebase-db.ts:", e);
    throw new Error("Falha ao inicializar Firebase Admin SDK: " + (e as Error).message);
  }
}

// === Agora, todas as suas funções de DB continuam usando getAdminDatabaseInstance() ===

// Definição do tipo para o status de pagamento
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface BetData {
  id: string;
  numbers: number[];
  shares: number;
  createdAt: string;
  status: 'active' | 'cancelled' | string;
  campaignId: string;
  inviteId: string;
  participantSessionId?: string;
  comprovanteUrl?: string; // Manter este campo, mesmo que não seja usado para upload de imagem, para manter a estrutura de dados existente
  participantName?: string;
  paymentStatus: PaymentStatus;
}

// NOVO: Interface para o grupo de apostas de um convite na base de dados
export interface InviteGroupData {
    inviteId: string;
    campaignId: string;
    participantName: string;
    totalShares: number;
    bets: BetData[]; // Lista das apostas individuais
    firstBetCreatedAt: string; // Para ordenação ou exibição
    paymentStatusOverall: PaymentStatus; // Status geral do convite (ex: 'pending' se qualquer uma for pendente)
}


export async function addBetToFirebase(betData: BetData): Promise<void> {
  try {
    const db = getAdminDatabaseInstance();
    const betRef = db.ref(`bets/${betData.id}`);
    await betRef.set(betData);
    console.log(`[Firebase] Aposta ${betData.id} adicionada com sucesso com status ${betData.paymentStatus}.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao adicionar aposta ${betData.id}:`, error);
    throw new Error('Falha ao adicionar aposta ao Firebase.');
  }
}

export async function getBetsFromFirebase(inviteId: string): Promise<BetData[]> {
  try {
    const db = getAdminDatabaseInstance();
    const betsQuery = db.ref('bets').orderByChild('inviteId').equalTo(inviteId);
    const snapshot: AdminDataSnapshot = await betsQuery.once('value'); 

    if (snapshot.exists()) {
      const bets: BetData[] = [];
      snapshot.forEach((child_snapshot: AdminDataSnapshot) => { 
        bets.push(child_snapshot.val());
      });
      console.log(`[Firebase] ${bets.length} apostas encontradas para o inviteId ${inviteId}.`);
      return bets;
    } else {
      console.log(`[Firebase] Nenhuma aposta encontrada para o inviteId ${inviteId}.`);
      return [];
    }
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao buscar apostas para inviteId ${inviteId}:`, error);
    throw new Error('Falha ao buscar apostas no Firebase.');
  }
}

// ===============================================
// VERSÃO CORRIGIDA DA FUNÇÃO getCampaignBetsFromFirebase
// ===============================================
export async function getCampaignBetsFromFirebase(campaignId: string, paymentStatusFilter?: PaymentStatus): Promise<BetData[]> {
  try {
    const db = getAdminDatabaseInstance();
    // Sempre ordene e filtre por 'campaignId' primeiro
    const betsQuery: AdminQueryType = db.ref('bets').orderByChild('campaignId').equalTo(campaignId);
    
    const snapshot: AdminDataSnapshot = await betsQuery.once('value');

    if (snapshot.exists()) {
      const allBetsForCampaign: BetData[] = [];
      snapshot.forEach((child_snapshot: AdminDataSnapshot) => { 
        allBetsForCampaign.push(child_snapshot.val());
      });
      
      // Se houver um filtro de status de pagamento, filtre os resultados em memória
      if (paymentStatusFilter) {
        const filteredBets = allBetsForCampaign.filter(bet => bet.paymentStatus === paymentStatusFilter);
        console.log(`[Firebase] ${filteredBets.length} apostas encontradas para a campanha ${campaignId} com status ${paymentStatusFilter}.`);
        return filteredBets;
      } else {
        // Se não houver filtro de status, retorne todas as apostas para a campanha
        console.log(`[Firebase] ${allBetsForCampaign.length} apostas encontradas para a campanha ${campaignId} (todos os status).`);
        return allBetsForCampaign;
      }
    } else {
      console.log(`[Firebase] Nenhuma aposta encontrada para a campanha ${campaignId} com status ${paymentStatusFilter || 'todos'}.`);
      return [];
    }
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao buscar apostas da campanha ${campaignId}:`, error);
    throw new Error('Falha ao buscar apostas da campanha no Firebase.');
  }
}

export async function getBetsByPaymentStatus(statusFilter: PaymentStatus): Promise<BetData[]> {
  try {
    const db = getAdminDatabaseInstance();
    const betsQuery = db.ref('bets').orderByChild('paymentStatus').equalTo(statusFilter);
    const snapshot: AdminDataSnapshot = await betsQuery.once('value');

    if (snapshot.exists()) {
      const bets: BetData[] = [];
      snapshot.forEach((child_snapshot: AdminDataSnapshot) => { 
        bets.push(child_snapshot.val());
      });
      console.log(`[Firebase] ${bets.length} apostas encontradas com status ${statusFilter}.`);
      return bets;
    } else {
      console.log(`[Firebase] Nenhuma aposta encontrada com status ${statusFilter}.`);
      return [];
    }
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao buscar apostas por status ${statusFilter}:`, error);
    throw new Error('Falha ao buscar apostas por status no Firebase.');
  }
}

export async function updateBetPaymentStatus(betId: string, newStatus: PaymentStatus): Promise<void> {
  console.log(`[Firebase DB] Tentando atualizar aposta ${betId} para o status: ${newStatus}.`);
  try {
    const db = getAdminDatabaseInstance(); // Garante que a instância do DB está pronta
    const betRef = db.ref(`bets/${betId}`);
    
    // Log antes da operação de update
    console.log(`[Firebase DB] Realizando operação de update para bets/${betId} com { paymentStatus: ${newStatus}, updatedAt: ${new Date().toISOString()} }.`);
    await betRef.update({ paymentStatus: newStatus, updatedAt: new Date().toISOString() });
    // Log após a operação de update
    console.log(`[Firebase DB] Operação de update concluída para aposta ${betId}.`);
    
    console.log(`[Firebase] Status de pagamento da aposta ${betId} atualizado para ${newStatus}.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro crítico ao atualizar status da aposta ${betId}:`, error);
    // Relança o erro para ser capturado pela API Route
    throw new Error('Falha ao atualizar status da aposta no Firebase. Detalhes no log do servidor.');
  }
}

// NOVO: Função para buscar e agrupar convites pendentes por campanha
export async function getPendingInviteGroupsByCampaign(campaignIdFilter?: string): Promise<InviteGroupData[]> {
  try {
    const db = getAdminDatabaseInstance();
    const betsRef = db.ref('bets');
    // Filtra inicialmente por paymentStatus 'pending'
    const snapshot = await betsRef.orderByChild('paymentStatus').equalTo('pending').once('value');

    const pendingBets: BetData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child_snapshot) => {
        const bet = child_snapshot.val() as BetData;
        // Se um filtro de campanha for fornecido, aplique-o
        if (!campaignIdFilter || bet.campaignId === campaignIdFilter) {
          pendingBets.push(bet);
        }
      });
    }

    const inviteGroups: { [key: string]: InviteGroupData } = {};

    pendingBets.forEach(bet => {
      if (!inviteGroups[bet.inviteId]) {
        inviteGroups[bet.inviteId] = {
          inviteId: bet.inviteId,
          campaignId: bet.campaignId,
          participantName: bet.participantName || `Participante ${bet.inviteId.substring(0, 4)}...`,
          totalShares: 0,
          bets: [],
          firstBetCreatedAt: bet.createdAt, // Assume a primeira aposta adicionada como referência
          paymentStatusOverall: 'pending' // Começa como pendente
        };
      }
      inviteGroups[bet.inviteId].bets.push(bet);
      inviteGroups[bet.inviteId].totalShares += bet.shares;
      // Garante que o status geral do convite permaneça pendente se alguma aposta for pendente
      // (embora todas aqui já sejam "pending" pelo filtro inicial)
      if (bet.paymentStatus === 'pending') {
          inviteGroups[bet.inviteId].paymentStatusOverall = 'pending';
      }
    });

    // Converte o objeto em um array e ordena pela data da primeira aposta (opcional)
    return Object.values(inviteGroups).sort((a, b) => new Date(a.firstBetCreatedAt).getTime() - new Date(b.firstBetCreatedAt).getTime());

  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao buscar e agrupar convites pendentes por campanha:`, error);
    throw new Error('Falha ao buscar e agrupar convites pendentes no Firebase.');
  }
}

// NOVO: Função para atualizar o status de pagamento de TODAS as apostas de um invite
export async function updateBetsPaymentStatusByInvite(inviteId: string, newStatus: PaymentStatus): Promise<void> {
    console.log(`[Firebase DB] Tentando atualizar todas as apostas do convite ${inviteId} para o status: ${newStatus}.`);
    try {
        const db = getAdminDatabaseInstance();
        const betsQuery = db.ref('bets').orderByChild('inviteId').equalTo(inviteId);
        const snapshot = await betsQuery.once('value');

        if (snapshot.exists()) {
            const updates: { [key: string]: any } = {};
            snapshot.forEach((child_snapshot) => {
                const betId = child_snapshot.key;
                if (betId) {
                    updates[`${betId}/paymentStatus`] = newStatus;
                    updates[`${betId}/updatedAt`] = new Date().toISOString();
                }
            });

            if (Object.keys(updates).length > 0) {
                // Realiza um update multi-caminho para atualizar todas as apostas relacionadas ao inviteId
                await db.ref('bets').update(updates);
                console.log(`[Firebase DB] Todas as apostas do convite ${inviteId} atualizadas para ${newStatus}.`);
            } else {
                console.log(`[Firebase DB] Nenhuma aposta encontrada para o convite ${inviteId} para atualizar.`);
            }
        } else {
            console.log(`[Firebase DB] Convite ${inviteId} não encontrado.`);
        }
    } catch (error) {
        console.error(`[Firebase ERROR] Erro crítico ao atualizar status das apostas do convite ${inviteId}:`, error);
        throw new Error('Falha ao atualizar status das apostas por convite no Firebase. Detalhes no log do servidor.');
    }
}


export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const db = getAdminDatabaseInstance();
  const newCampaignRef = db.ref('campaigns').push();
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: newCampaignRef.key!,
    createdAt: now,
    updatedAt: now,
    ...campaignData,
  };
  try {
    await newCampaignRef.set(campaign);
    console.log(`[Firebase] Campanha ${campaign.id} criada com sucesso.`);
    return campaign;
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao criar campanha:`, error);
    throw new Error('Falha ao criar campanha no Firebase.');
  }
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  try {
    const db = getAdminDatabaseInstance();
    const campaignRef = db.ref(`campaigns/${campaignId}`);
    const snapshot: AdminDataSnapshot = await campaignRef.once('value');
    if (snapshot.exists()) {
      console.log(`[Firebase] Campanha ${campaignId} encontrada.`);
      return snapshot.val() as Campaign;
    } else {
      console.log(`[Firebase] Campanha ${campaignId} não encontrada.`);
      return null;
    }
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao obter campanha ${campaignId}:`, error);
    throw new Error('Falha ao obter campanha do Firebase.');
  }
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    // Return cached campaigns when still valid
    const now = Date.now();
    if (campaignsCache && (now - campaignsCache.fetchedAt) < CAMPAIGNS_CACHE_TTL_MS) {
      // Serve from cache
      return campaignsCache.data;
    }

    const db = getAdminDatabaseInstance();
    const campaignsRef = db.ref('campaigns');
    const snapshot: AdminDataSnapshot = await campaignsRef.once('value');
    const campaigns: Campaign[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child_snapshot: AdminDataSnapshot) => { 
        campaigns.push(child_snapshot.val() as Campaign);
      });
      console.log(`[Firebase] ${campaigns.length} campanhas encontradas.`);
    } else {
      console.log(`[Firebase] Nenhuma campanha encontrada.`);
    }

    // Update cache
    campaignsCache = { data: campaigns, fetchedAt: now };
    return campaigns;
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao obter todas as campanhas:`, error);
    throw new Error('Falha ao obter campanhas do Firebase.');
  }
}

export async function updateCampaign(campaignId: string, updates: Partial<Omit<Campaign, 'id' | 'createdAt'>>): Promise<Campaign> {
  try {
    const db = getAdminDatabaseInstance();
    const campaignRef = db.ref(`campaigns/${campaignId}`);
    const now = new Date().toISOString();
    await campaignRef.update({ ...updates, updatedAt: now });

    const updatedCampaign = await getCampaignById(campaignId);
    if (!updatedCampaign) {
      throw new Error('Campanha não encontrada após atualização.');
    }
    console.log(`[Firebase] Campanha ${campaignId} atualizada com sucesso.`);
    return updatedCampaign;
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao atualizar campanha ${campaignId}:`, error);
    throw new Error('Falha ao atualizar campanha no Firebase.');
  }
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  try {
    const db = getAdminDatabaseInstance();
    const campaignRef = db.ref(`campaigns/${campaignId}`);
    await campaignRef.remove();
    console.log(`[Firebase] Campanha ${campaignId} removida com sucesso.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao remover campanha ${campaignId}:`, error);
    throw new Error('Falha ao remover campanha do Firebase.');
  }
}