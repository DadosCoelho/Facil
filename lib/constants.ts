// constants.ts

/**
 * Tamanho máximo permitido para arquivos de upload em megabytes (MB).
 * Usado para validação no frontend.
 * O valor real para validação no backend é UPLOAD_MAX_FILE_SIZE_BYTES.
 */
export const UPLOAD_MAX_FILE_SIZE_MB = 5;

/**
 * Tipos MIME de arquivos de imagem permitidos para upload de comprovantes.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Você pode adicionar mais constantes aqui, como:

/**
 * Número mínimo de dezenas para uma aposta na Lotofácil.
 */
export const LOTOFACIL_MIN_NUMBERS = 15;

/**
 * Número máximo de dezenas para uma aposta na Lotofácil.
 */
export const LOTOFACIL_MAX_NUMBERS = 20;

/**
 * Intervalo dos números da Lotofácil (de 1 a 25).
 */
export const LOTOFACIL_NUMBER_RANGE_START = 1;
export const LOTOFACIL_NUMBER_RANGE_END = 25;

/**
 * Mensagem padrão de erro para o usuário.
 */
export const GENERIC_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Por favor, tente novamente.';