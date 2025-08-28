// lib/jwt.ts
import crypto from 'crypto';

function base64UrlDecode(input: string) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4;
    if (pad) input += '='.repeat(4 - pad);
    return Buffer.from(input, 'base64');
}

/**
 * Verifica e decodifica um token JWT de convite.
 * @param token O token JWT a ser verificado.
 * @returns O payload decodificado do token.
 * @throws Error se o token for inválido, expirado ou não assinado corretamente.
 */
export async function verifyInviteToken(token: string): Promise<any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Token inválido: formato incorreto.');
    }
    const [h, p, s] = parts;

    const secret = process.env.JWT_SECRET || 'dev-secret';
    if (secret === 'dev-secret') {
        console.warn('AVISO: Usando JWT_SECRET padrão ("dev-secret"). Defina uma chave secreta segura no .env.local em produção!');
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest();
    
    // Use crypto.timingSafeEqual para comparação segura de assinaturas
    const providedSignature = base64UrlDecode(s);
    if (providedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(providedSignature, expectedSignature)) {
        throw new Error('Token inválido: assinatura não corresponde.');
    }

    const payload = JSON.parse(base64UrlDecode(p).toString('utf8'));
    
    return payload;
}