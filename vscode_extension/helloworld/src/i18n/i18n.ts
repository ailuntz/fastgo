import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface LocaleData {
    [key: string]: string;
}

class I18n {
    private static instance: I18n;
    private currentLocale: string = 'en';
    private localeData: LocaleData = {};
    private extensionPath: string = '';

    private constructor() {}

    public static getInstance(): I18n {
        if (!I18n.instance) {
            I18n.instance = new I18n();
        }
        return I18n.instance;
    }

    public init(extensionPath: string): void {
        this.extensionPath = extensionPath;
        this.currentLocale = this.detectLocale();
        this.loadLocale(this.currentLocale);
    }

    private detectLocale(): string {
        const vscodeLang = vscode.env.language;
        
        // Map VSCode language codes to our supported locales
        const langMap: { [key: string]: string } = {
            'zh-cn': 'zh-cn',
            'zh-tw': 'zh-cn', // Use zh-cn for traditional Chinese as fallback
            'zh': 'zh-cn',
            'en': 'en',
            'en-us': 'en',
            'en-gb': 'en'
        };

        return langMap[vscodeLang.toLowerCase()] || 'en';
    }

    private loadLocale(locale: string): void {
        try {
            const localePath = path.join(this.extensionPath, 'src', 'i18n', 'locales', `${locale}.json`);
            
            if (fs.existsSync(localePath)) {
                const content = fs.readFileSync(localePath, 'utf-8');
                this.localeData = JSON.parse(content);
            } else {
                // Fallback to English if locale file doesn't exist
                const fallbackPath = path.join(this.extensionPath, 'src', 'i18n', 'locales', 'en.json');
                if (fs.existsSync(fallbackPath)) {
                    const content = fs.readFileSync(fallbackPath, 'utf-8');
                    this.localeData = JSON.parse(content);
                }
            }
        } catch (error) {
            console.error(`Failed to load locale ${locale}:`, error);
            // Use empty object as fallback
            this.localeData = {};
        }
    }

    public t(key: string, params?: { [key: string]: string | number }): string {
        let text = this.localeData[key] || key;
        
        // Replace parameters if provided
        if (params) {
            Object.keys(params).forEach(paramKey => {
                text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
            });
        }
        
        return text;
    }

    public getCurrentLocale(): string {
        return this.currentLocale;
    }

    public setLocale(locale: string): void {
        this.currentLocale = locale;
        this.loadLocale(locale);
    }
}

// Export singleton instance
export const i18n = I18n.getInstance();

// Convenience function for translation
export function t(key: string, params?: { [key: string]: string | number }): string {
    return i18n.t(key, params);
}