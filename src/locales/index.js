import en from './en.json';
import ptBR from './pt-BR.json';
import es from './es.json';

// Settings lists each language using the name from its own translation file.
export const translations = { en, 'pt-BR': ptBR, es };
export const languageCodes = Object.keys(translations);
