// lib/sheets.ts
import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
    if (sheetsClient) {
        return sheetsClient;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // ALTERAR: Adicionar escopo de somente leitura para Drive
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
}

// Interface para os dados da aposta que serão salvos na planilha
interface BetDataToSheet {
    id: string; // jogoId ou transactionId
    campaignId: string;
    inviteId: string;
    participantSessionId?: string; // Opcional
    numbers: number[]; // Array de números da aposta
    shares: number; // Quantidade de cotas
    status: 'active' | 'cancelled';
    createdAt: string; // Timestamp de criação
}

// NOVO: Interface para o formato de dados lidos da planilha
// Adapte isso para corresponder às COLUNAS da sua aba "Jogos"
// e aos tipos que você espera para cada campo.
interface BetDataFromSheet {
    createdAt: string;
    campaignId: string;
    inviteId: string;
    transactionId: string; // Corresponde ao `bet.id` ou `transactionId`
    numbers: string; // Números vêm como string "01 02 ..."
    shares: number;
    status: string;
    comprovanteUrl?: string; // Se você ainda tem essa coluna, mesmo que vazia
}


/**
 * Adiciona uma nova linha de aposta à planilha do Google Sheets.
 * @param bet Os dados da aposta a serem salvos.
 * @returns Promise<boolean> True se a operação foi bem-sucedida, False caso contrário.
 */
export async function appendBetToSheet(bet: BetDataToSheet): Promise<boolean> {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const range = 'Jogos!A:Z'; // Ajuste 'Jogos' e o range conforme sua planilha.

    if (!spreadsheetId) {
        console.error('ERRO: GOOGLE_SHEETS_SPREADSHEET_ID não configurado. Não é possível salvar na planilha.');
        return false;
    }

    // Mapeia os dados da aposta para a ordem das colunas na sua planilha
    // Verifique a ordem EXATA das suas colunas.
    const values = [
        new Date(bet.createdAt).toISOString(), // Coluna 1 (A)
        bet.campaignId,                     // Coluna 2 (B)
        bet.inviteId,                       // Coluna 3 (C)
        bet.id,                             // Coluna 4 (D)
        bet.numbers.map(n => n.toString().padStart(2, '0')).join(' '), // Coluna 5 (E)
        bet.shares,                         // Coluna 6 (F)
        bet.status,                         // Coluna 7 (G)
        '',                                 // Coluna 8 (H) - Comprovante URL (agora vazia)
        // Adicione aqui os valores para quaisquer outras colunas que você tenha na sua planilha.
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [values],
            },
        });
        console.log(`[SHEETS] Aposta ${bet.id} registrada com sucesso na planilha!`);
        return true;
    } catch (error) {
        console.error(`[SHEETS ERROR] Erro ao registrar aposta ${bet.id} na planilha:`, error);
        return false;
    }
}


/**
 * NOVO: Obtém todas as apostas para um dado inviteId da planilha.
 * @param inviteId O ID do convite para filtrar as apostas.
 * @returns Promise<BetDataFromSheet[]> Um array de objetos de apostas.
 */
export async function getBetsByInviteId(targetInviteId: string): Promise<BetDataFromSheet[]> {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const range = 'Jogos!A:H'; // Ajuste 'Jogos' e o range das colunas que você quer ler.

    if (!spreadsheetId) {
        console.error('ERRO: GOOGLE_SHEETS_SPREADSHEET_ID não configurado. Não é possível ler da planilha.');
        return [];
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return []; // Nenhuma aposta encontrada
        }

        const bets: BetDataFromSheet[] = [];
        // Ignora a primeira linha se for o cabeçalho
        for (let i = 1; i < rows.length; i++) { // Começa do índice 1 para pular o cabeçalho
            const row = rows[i];
            // Certifique-se de que a coluna do inviteId (índice 2) existe e corresponde
            if (row && row.length > 2 && row[2] === targetInviteId) { 
                bets.push({
                    createdAt: row[0],
                    campaignId: row[1],
                    inviteId: row[2],
                    transactionId: row[3],
                    numbers: row[4],
                    shares: parseInt(row[5]),
                    status: row[6],
                    comprovanteUrl: row[7] || '',
                });
            }
        }
        console.log(`[SHEETS] ${bets.length} apostas encontradas para o inviteId ${targetInviteId}.`);
        return bets;

    } catch (error) {
        console.error(`[SHEETS ERROR] Erro ao ler apostas da planilha para inviteId ${targetInviteId}:`, error);
        return [];
    }
}