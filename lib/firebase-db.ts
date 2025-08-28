// facil/lib/firebase-db.ts

import { ref, push, set, query, orderByChild, equalTo, get } from "firebase/database";
import { database } from "./firebase"; // Importa a instância do database

// Definição da interface Bet (ajuste conforme a necessidade, mas baseada na sua)
interface BetData {
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
    // Cria uma referência para o nó específico usando o ID da aposta
    const betRef = ref(database, `bets/${betData.id}`);
    
    // Salva os dados da aposta. Se o ID já existir, ele será sobrescrito.
    // Certifique-se que betData.id é único para cada nova aposta.
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
    // Cria uma query para buscar apostas onde 'inviteId' é igual ao valor fornecido
    const betsQuery = query(
      ref(database, 'bets'),
      orderByChild('inviteId'),
      equalTo(inviteId)
    );

    const snapshot = await get(betsQuery);

    if (snapshot.exists()) {
      const bets: BetData[] = [];
      snapshot.forEach((childSnapshot) => {
        bets.push(childSnapshot.val()); // childSnapshot.val() retorna o objeto da aposta
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