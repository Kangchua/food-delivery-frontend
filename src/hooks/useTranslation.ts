import vi from '@/locales/vi.json';

// Namespace types
type Translations = typeof vi;
type Namespace = keyof Translations;

// Deep nested key helper
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}` | K
        : K;
    }[keyof T & string]
  : never;

// Full translation key (namespace.key format)
type TranslationKey = {
  [N in Namespace]: `${N}.${NestedKeyOf<Translations[N]>}`;
}[Namespace];

// Get value type from nested path
type GetNestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? GetNestedValue<T[First], Rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;

/**
 * Hook for translations
 * 
 * Usage:
 * const { t } = useTranslation();
 * t('common.loading') // "Đang tải..."
 * t('validation.minLength', { min: 6 }) // "Tối thiểu 6 ký tự"
 */
export const useTranslation = () => {
  /**
   * Translate a key to Vietnamese
   * @param key - Translation key in format "namespace.key" (e.g., "common.loading")
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = vi;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`[i18n] Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`[i18n] Translation value is not a string: ${key}`);
      return key;
    }

    // Replace parameters like {min}, {max}, {count}
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => 
          str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
        value
      );
    }

    return value;
  };

  /**
   * Get translations for a specific namespace
   * @param namespace - The namespace to get translations for
   * @returns Object containing all translations in that namespace
   */
  const getNamespace = <N extends Namespace>(namespace: N): Translations[N] => {
    return vi[namespace];
  };

  /**
   * Check if a translation key exists
   * @param key - Translation key to check
   * @returns boolean
   */
  const hasKey = (key: string): boolean => {
    const keys = key.split('.');
    let value: unknown = vi;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  };

  return { 
    t, 
    getNamespace,
    hasKey,
    locale: 'vi' as const 
  };
};

// Export type for external usage
export type { TranslationKey, Namespace };

export default useTranslation;
