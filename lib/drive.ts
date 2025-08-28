// lib/drive.ts
import { google } from 'googleapis';
// import { OAuth2Client } from 'google-auth-library'; // Não é necessário se você estiver usando GoogleAuth
import { Readable } from 'stream'; // <-- ESTE É CRÍTICO para o erro "pipe is not a function"

// Se você já tem esse tipo definido em outro lugar, pode remover
import type { drive_v3 } from 'googleapis'; // Boa prática de tipagem, mas não resolve o erro de runtime

let driveClient: drive_v3.Drive | null = null; // Use o tipo drive_v3.Drive se você o importou

function getDriveClient(): drive_v3.Drive { // Use o tipo drive_v3.Drive se você o importou
    if (driveClient) {
        return driveClient;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            // Mantenha a correção correta da chave privada
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\n/g, '\n'), 
        },
        scopes: ['https://www.googleapis.com/auth/drive'], 
    });

    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
}

export async function uploadFileToDrive(
    fileName: string,
    fileBuffer: Buffer,
    fileMimeType: string,
    folderId: string
): Promise<string> {
    const drive = getDriveClient();

    // ESSA É A PARTE MAIS IMPORTANTE PARA RESOLVER O ERRO "pipe is not a function"
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null); 

    try {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
                mimeType: fileMimeType,
            },
            media: {
                mimeType: fileMimeType,
                body: readableStream, // <--- AQUI DEVE SER O readableStream
            },
            fields: 'id,webViewLink',
            supportsAllDrives: true,
        });

        if (response.status === 200 && response.data.id && response.data.webViewLink) {
            try {
                await drive.permissions.create({
                    fileId: response.data.id,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                    fields: 'id',
                });
            } catch (permissionError) {
                console.warn('Não foi possível definir permissões públicas para o arquivo. Ele pode já ser público ou o escopo é limitado.', permissionError);
            }

            return response.data.webViewLink;
        } else {
            throw new Error('Falha ao fazer upload para o Google Drive: Resposta inválida.');
        }
    } catch (error) {
        console.error('Erro ao fazer upload para o Google Drive:', error);
        throw error;
    }
}
