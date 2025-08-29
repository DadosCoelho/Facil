// Facil/lib/firebase-db.ts
import { ref, push, set, query, orderByChild, equalTo, get, update, remove } from "firebase/database";
import { database } from "./firebase";
import { Campaign, CampaignStatus } from "@/types/Campaign";

// =========================================================
// ATUALIZADO: Definição da interface BetData com participantName
// =========================================================
export interface BetData {
  id: string;
  numbers: number[];
  shares: number;
  createdAt: string;
  status: 'active' | 'cancelled' | string;
  campaignId: string;
  inviteId: string;
  participantSessionId?: string;
  comprovanteUrl?: string;
  participantName?: string; // NOVO: Campo para armazenar o nome do participante
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

// =========================================================
// NOVO: Função para buscar todas as apostas de uma campanha
// =========================================================
export async function getCampaignBetsFromFirebase(campaignId: string): Promise<BetData[]> {
  try {
    const betsQuery = query(
      ref(database, 'bets'),
      orderByChild('campaignId'), // Filtra pela campaignId
      equalTo(campaignId)
    );

    const snapshot = await get(betsQuery);

    if (snapshot.exists()) {
      const bets: BetData[] = [];
      snapshot.forEach((childSnapshot) => {
        bets.push(childSnapshot.val());
      });
      console.log(`[Firebase] ${bets.length} apostas encontradas para a campanha ${campaignId}.`);
      return bets;
    } else {
      console.log(`[Firebase] Nenhuma aposta encontrada para a campanha ${campaignId}.`);
      return [];
    }
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao buscar apostas da campanha ${campaignId}:`, error);
    throw new Error('Falha ao buscar apostas da campanha no Firebase.');
  }
}

// =========================================================
// Funções CRUD para Campanhas (sem alteração neste pedido)
// =========================================================
export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const newCampaignRef = push(ref(database, 'campaigns'));
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: newCampaignRef.key!,
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

export async function updateCampaign(campaignId: string, updates: Partial<Omit<Campaign, 'id' | 'createdAt'>>): Promise<Campaign> {
  try {
    const campaignRef = ref(database, `campaigns/${campaignId}`);
    const now = new Date().toISOString();
    await update(campaignRef, { ...updates, updatedAt: now });

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
    const campaignRef = ref(database, `campaigns/${campaignId}`);
    await remove(campaignRef);
    console.log(`[Firebase] Campanha ${campaignId} removida com sucesso.`);
  } catch (error) {
    console.error(`[Firebase ERROR] Erro ao remover campanha ${campaignId}:`, error);
    throw new Error('Falha ao remover campanha do Firebase.');
  }
}