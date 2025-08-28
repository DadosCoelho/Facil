// lib/jwt.ts
import crypto from 'crypto';

// Helper function for base64url encoding (needed for signing)
function base64UrlEncode(input: Buffer | string): string {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(input: string) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4;
    if (pad) input += '='.repeat(4 - pad);
    return Buffer.from(input, 'base64');
}

/**
 * Assina um payload para criar um token JWT.
 * @param payload O objeto de dados a ser incluído no token.
 * @param secret A chave secreta para assinar o token.
 * @returns O token JWT assinado.
 */
export function sign(payload: object, secret: string): string { // NOVO: exportar a função sign
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', secret).update(data).digest();
    return `${data}.${base64UrlEncode(signature)}`;
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