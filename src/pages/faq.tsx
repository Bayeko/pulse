import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PulseButton } from '@/components/ui/pulse-button';
import { Textarea } from '@/components/ui/textarea';
import logger from '@/lib/logger';
import { useTranslation } from '@/i18n';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [message, setMessage] = useState('');
 codex/delete-stray-tokens-and-remove-duplicate-button
  const { t } = useTranslation();

  const { lang } = useTranslation();

  const { t, lang } = useTranslation();
 main

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        const res = await fetch('/faq.json');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        logger.error('Failed to load FAQ', err);
      }
    };
    loadFAQ();
  }, []);

  const handleContact = () => {
    if (navigator.onLine) {
      window.location.href = 'mailto:support@example.com';
    } else {
      setShowOfflineForm(true);
    }
  };

  const handleOfflineSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('offlineSupportMessages') || '[]');
    stored.push({ message, timestamp: new Date().toISOString() });
    localStorage.setItem('offlineSupportMessages', JSON.stringify(stored));
    setMessage('');
    setShowOfflineForm(false);
    alert('Message saved locally. It will be sent when you are back online.');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-6">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full mb-8">
        {items.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mb-8">
        <a
          href="https://www.aasect.org/referral-directory"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {t('proResources')}
        </a>
      </div>
      {showOfflineForm ? (
        <form onSubmit={handleOfflineSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message"
            maxLength={lang === 'fr' ? 400 : 500}
          />
          <PulseButton type="submit">Save Message</PulseButton>
        </form>
      ) : (
        <PulseButton onClick={handleContact}>Contact support</PulseButton>
      )}
    </div>
  );
};

export default FAQ;

