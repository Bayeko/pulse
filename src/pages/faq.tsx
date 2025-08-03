codex/add-help-center-section-in-settings
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Frequently asked questions will appear here.</p>
          </CardContent>
        </Card>
      </div>

import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PulseButton } from '@/components/ui/pulse-button';
import { Textarea } from '@/components/ui/textarea';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        const res = await fetch('/faq.json');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Failed to load FAQ', err);
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
      {showOfflineForm ? (
        <form onSubmit={handleOfflineSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message"
          />
          <PulseButton type="submit">Save Message</PulseButton>
        </form>
      ) : (
        <PulseButton onClick={handleContact}>Contact support</PulseButton>
      )}
 main
    </div>
  );
};

export default FAQ;
