'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/lib/translations';

interface FeedbackButtonProps {
  lang: Language;
  variant?: 'large' | 'small' | 'footer';
}

const localTranslations: Record<string, {
  feedbackTitle: string;
  feedbackDesc: string;
  copyEmail: string;
  copied: string;
  openMail: string;
  close: string;
  contactUs: string;
}> = {
  he: {
    feedbackTitle: 'משוב והצעות ייעול',
    feedbackDesc: 'נשמח לשמוע את הצעות הייעול והפידבק שלכם! שלחו לנו מייל לכתובת:',
    copyEmail: 'העתק כתובת אימייל',
    copied: 'הועתק ללוח!',
    openMail: 'פתח אפליקציית מייל',
    close: 'סגור',
    contactUs: 'יצירת קשר',
  },
  en: {
    feedbackTitle: 'Feedback & Suggestions',
    feedbackDesc: "We'd love to hear your feedback and suggestions! Email us at:",
    copyEmail: 'Copy Email Address',
    copied: 'Copied!',
    openMail: 'Open Mail App',
    close: 'Close',
    contactUs: 'Contact Us',
  },
  ar: {
    feedbackTitle: 'الآراء والاقتراحات',
    feedbackDesc: 'يسعدنا سماع اقتراحاتكم للتحسين! راسلونا على:',
    copyEmail: 'نسخ البريد الإلكتروني',
    copied: 'تم النسخ!',
    openMail: 'فتح تطبيق البريد',
    close: 'إغلاق',
    contactUs: 'اتصل بنا',
  },
  es: {
    feedbackTitle: 'Comentarios y sugerencias',
    feedbackDesc: '¡Nos encantaría escuchar tus sugerencias de mejora! Envíanos un correo a:',
    copyEmail: 'Copiar correo electrónico',
    copied: '¡Copiado!',
    openMail: 'Abrir correo',
    close: 'Cerrar',
    contactUs: 'Contáctenos',
  },
  ru: {
    feedbackTitle: 'Отзывы и предложения',
    feedbackDesc: 'Мы будем рады услышать ваши предложения по улучшению! Напишите нам:',
    copyEmail: 'Копировать адрес',
    copied: 'Скопировано!',
    openMail: 'Открыть почту',
    close: 'Закрыть',
    contactUs: 'Связаться с нами',
  },
  fr: {
    feedbackTitle: 'Commentaires et suggestions',
    feedbackDesc: "Nous aimerions connaître vos suggestions d'amélioration ! Écrivez-nous à :",
    copyEmail: 'Copier l\'adresse',
    copied: 'Copié !',
    openMail: 'Ouvrir la messagerie',
    close: 'Fermer',
    contactUs: 'Contactez-nous',
  },
  de: {
    feedbackTitle: 'Feedback & Vorschläge',
    feedbackDesc: 'Wir freuen uns auf Ihre Verbesserungsvorschläge! Schreiben Sie uns an:',
    copyEmail: 'E-Mail-Adresse kopieren',
    copied: 'Kopiert!',
    openMail: 'Mail-App öffnen',
    close: 'Schließen',
    contactUs: 'Kontaktieren Sie uns',
  },
  zh: {
    feedbackTitle: '意见与建议',
    feedbackDesc: '我们很乐意听取您的改进建议！请发送邮件至：',
    copyEmail: '复制邮箱地址',
    copied: '已复制！',
    openMail: '打开邮件应用',
    close: '关闭',
    contactUs: '联系我们',
  },
  hi: {
    feedbackTitle: 'प्रतिक्रिया और सुझाव',
    feedbackDesc: 'हम आपके सुधार के सुझाव सुनना पसंद करेंगे! हमें इस पर ईमेल करें:',
    copyEmail: 'ईमेल कॉपी करें',
    copied: 'कॉपी किया गया!',
    openMail: 'मेल ऐप खोलें',
    close: 'बंद करें',
    contactUs: 'संपर्क करें',
  }
};

export default function FeedbackButton({ lang, variant = 'small' }: FeedbackButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const t = localTranslations[lang] || localTranslations['en'];
  const email = 'clearpick.ai@gmail.com';
  const isRTL = lang === 'he' || lang === 'ar';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleOpenMail = () => {
    window.location.href = `mailto:${email}?subject=Feedback%20for%20ClearPick.ai`;
  };

  return (
    <>
      {variant === 'large' && (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-6 px-12 py-6 glass-panel-premium rounded-2xl hover:bg-white/[0.04] hover:border-[#F5C842]/30 transition-all active:scale-95 group cursor-pointer text-left border border-white/5"
        >
          <span className="material-symbols-outlined text-[#F5C842] text-2xl">chat_bubble</span>
          <span className="font-display-lg text-xl font-semibold text-white">{t.feedbackTitle}</span>
          <span 
            className="material-symbols-outlined text-white/40 text-xl group-hover:translate-x-[-8px] transition-transform"
            style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}
          >
            chevron_left
          </span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-400 font-label-caps text-xs tracking-widest hover:text-[#F5C842] transition-colors uppercase cursor-pointer bg-transparent border-none p-0 min-h-0 min-w-0 font-bold"
        >
          {t.contactUs}
        </button>
      )}

      {variant === 'small' && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#141418] border border-white/10 hover:border-[#F5C842]/30 hover:bg-white/5 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-lg"
        >
          <span className="text-sm">💬</span>
          <span>{t.feedbackTitle}</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div 
            className="glass-panel-premium max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative flex flex-col gap-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-[#F5C842]/10 border border-[#F5C842]/20 flex items-center justify-center text-[#F5C842]">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-white font-display-lg">{t.feedbackTitle}</h3>
              <p className="text-sm text-gray-400 font-body-md leading-relaxed">
                {t.feedbackDesc}
              </p>
            </div>

            {/* Email Box */}
            <div 
              onClick={handleCopy}
              className="bg-black/40 border border-white/10 rounded-2xl py-4 px-5 font-mono text-sm text-[#F5C842] select-all flex items-center justify-between gap-3 cursor-pointer hover:border-[#F5C842]/30 transition group"
            >
              <span>{email}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="text-xs text-gray-400 group-hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition flex items-center gap-1 cursor-pointer font-sans"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                {copied ? t.copied : t.copyEmail}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleOpenMail}
                className="w-full bg-[#F5C842] hover:bg-[#D4A820] text-black font-bold py-3.5 rounded-xl transition duration-300 cursor-pointer flex items-center justify-center gap-2 font-display-lg text-sm"
              >
                <span className="material-symbols-outlined text-sm">mail</span>
                {t.openMail}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition duration-300 cursor-pointer font-display-lg text-sm"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
