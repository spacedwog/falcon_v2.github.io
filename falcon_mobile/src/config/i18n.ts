import * as Localization from 'expo-localization';
import I18n from 'i18n-js';

// Adicione uma declaração explícita com tipo "any"
const i18n = I18n as any;

// Traduções
i18n.translations = {
  en: {
    erro: 'Error',
    falha_comando: 'Failed to send command',
    resposta: 'Response',
    nenhum_comando: 'No command sent yet.',
  },
  pt: {
    erro: 'Erro',
    falha_comando: 'Falha ao enviar comando',
    resposta: 'Resposta',
    nenhum_comando: 'Nenhum comando enviado ainda.',
  },
};

// Configurações de idioma
i18n.locale = Localization.getLocales()[0]?.languageTag ?? 'pt';
i18n.fallbacks = true;

export default i18n;