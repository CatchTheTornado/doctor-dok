import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

export function NoRecordsAlert ({ title, children }) {
    return (
        <div className="h-auto overflow-auto">
        <div className="p-4 space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              {children}
            </AlertDescription>
        </Alert>
      </div>
    </div>
    );
};