'use client';

import { useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

interface FeedbackButtonProps {
  lang: Language;
}

export default function FeedbackButton({ lang }: FeedbackButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const t = translations[lang];

  return (
    <div className="flex justify-center mt-8 mb-2">
      <a
        href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai"
        className="flex items-center gap-2 bg-[#141418] border border-white/10 hover:border-[#F5C842]/30 hover:bg-white/5 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-lg"
      >
        <span className="text-sm">💬</span>
        <span>{t.feedback}</span>
      </a>
    </div>
  );
}
