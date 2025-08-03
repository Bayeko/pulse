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
    </div>
  );
};

export default FAQ;
