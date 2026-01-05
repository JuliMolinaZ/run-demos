import { useLanguage } from "./LanguageContext";
import { translations, TranslationKey } from "./translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.es || key;
  };

  return { t, language };
}
