const fs = require('fs');
const serviceAccountPath = './facil-61f9e-firebase-adminsdk-fbsvc-f91bf555c5.json'; // Ajuste o caminho se necessário

try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Stringify o objeto JSON completo. Isso escapará automaticamente as quebras de linha dentro da private_key.
    const firebaseConfigString = JSON.stringify(serviceAccount);
    
    // Exiba a string formatada para que você possa copiá-la
    console.log(`Copie e cole a linha abaixo no seu .env.local:\n`);
    console.log(`FIREBASE_ADMIN_SDK_CONFIG=${firebaseConfigString}`);
    
} catch (error) {
    console.error('Erro ao processar o arquivo:', error);
}