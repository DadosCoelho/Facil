// facil/lib/firebase-db.ts
// (Mantenha as importações e a interface BetData existentes)

import { ref, push, set, query, orderByChild, equalTo, get, update, remove } from "firebase/database";
import { database } from "./firebase"; // Importa a instância do database
import { Campaign, CampaignStatus } from "@/types/Campaign"; // NOVO: Importar a interface Campaign

// Definição da interface Bet (ajuste conforme a necessidade, mas baseada na sua)
export interface BetData { 
  id: string; // Para usar como chave ou atributo
  numbers: number[];
  shares: number;
  createdAt: string;
  status: 'active' | 'cancelled' | string;
  campaignId: string;
  inviteId: string; // Importante para buscas
  participantSessionId?: string;
  comprovanteUrl?: string; // Para o link do comprovante
}

/**
 * Adiciona uma nova aposta ao Firebase Realtime Database.
 * Cada aposta será um sub-nó sob '/bets' usando seu ID como chave.
 * @param betData Os dados da aposta a serem salvos.
 * @returns Promise<void>
 */
export async function addBetToFirebase(betData: BetData): Promise<void> {
  try {
    const betRef = ref(database, `bets/${betData.id}`);
    await set(betRef, betData);
    console.log(`[Firebase] Aposta ${betData.id} adicionada com sucesso.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao adicionar aposta ${betData.id}:`, error);
    throw new Error('Falha ao adicionar aposta ao Firebase.');
  }
}

/**
 * Busca apostas no Firebase Realtime Database com base no inviteId.
 * @param inviteId O ID do convite para filtrar as apostas.
 * @returns Promise<BetData[]> Um array de objetos de apostas.
 */
export async function getBetsFromFirebase(inviteId: string): Promise<BetData[]> {
  try {
    const betsQuery = query(
      ref(database, 'bets'),
      orderByChild('inviteId'),
      equalTo(inviteId)
    );

    const snapshot = await get(betsQuery);

    if (snapshot.exists()) {
      const bets: BetData[] = [];
      snapshot.forEach((childSnapshot) => {
        bets.push(childSnapshot.val());
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

// ==========================================================
// NOVO: Funções CRUD para Campanhas
// ==========================================================

/**
 * Cria uma nova campanha no Firebase Realtime Database.
 * @param campaignData Os dados da campanha a serem salvos (id será gerado se não fornecido).
 * @returns Promise<Campaign> A campanha criada com seu ID.
 */
export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const newCampaignRef = push(ref(database, 'campaigns')); // Firebase gera um ID único
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: newCampaignRef.key!, // O ID gerado pelo Firebase
    createdAt: now,
    updatedAt: now,
    ...campaignData,
  };
  try {
    await set(newCampaignRef, campaign);
    console.log(`[Firebase] Campanha ${campaign.id} criada com sucesso.`);
    return campaign;
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao criar campanha:`, error);
    throw new Error('Falha ao criar campanha no Firebase.');
  }
}

/**
 * Obtém uma campanha pelo seu ID.
 * @param campaignId O ID da campanha.
 * @returns Promise<Campaign | null> A campanha ou null se não encontrada.
 */
export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  try {
    const campaignRef = ref(database, `campaigns/${campaignId}`);
    const snapshot = await get(campaignRef);
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

/**
 * Obtém todas as campanhas.
 * @returns Promise<Campaign[]> Um array de campanhas.
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const campaignsRef = ref(database, 'campaigns');
    const snapshot = await get(campaignsRef);
    const campaigns: Campaign[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        campaigns.push(childSnapshot.val() as Campaign);
      });
      console.log(`[Firebase] ${campaigns.length} campanhas encontradas.`);
    } else {
      console.log(`[Firebase] Nenhuma campanha encontrada.`);
    }
    return campaigns;
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao obter todas as campanhas:`, error);
    throw new Error('Falha ao obter campanhas do Firebase.');
  }
}

/**
 * Atualiza uma campanha existente.
 * @param campaignId O ID da campanha a ser atualizada.
 * @param updates Os campos a serem atualizados.
 * @returns Promise<Campaign> A campanha atualizada.
 */
export async function updateCampaign(campaignId: string, updates: Partial<Omit<Campaign, 'id' | 'createdAt'>>): Promise<Campaign> {
  try {
    const campaignRef = ref(database, `campaigns/${campaignId}`);
    const now = new Date().toISOString();
    await update(campaignRef, { ...updates, updatedAt: now }); // Adiciona updatedAt
    
    // Opcional: buscar a campanha atualizada para retornar o objeto completo
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

/**
 * Remove uma campanha pelo seu ID.
 * @param campaignId O ID da campanha a ser removida.
 * @returns Promise<void>
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  try {
    const campaignRef = ref(database, `campaigns/${campaignId}`);
    await remove(campaignRef);
    console.log(`[Firebase] Campanha ${campaignId} removida com sucesso.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao remover campanha ${campaignId}:`, error);
    throw new Error('Falha ao remover campanha do Firebase.');
  }
}
