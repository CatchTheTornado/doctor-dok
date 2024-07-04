import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

const DatabaseLinkAlert: React.FC = () => {
    return (
        <div className="h-auto overflow-auto">
        <div className="p-4 space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Setup Database Encryption!</AlertTitle>
            <AlertDescription>
              Before using the app please setup the proper Encryption Key in application settings.
            </AlertDescription>
        </Alert>
      </div>
    </div>
    );
};

export default DatabaseLinkAlert;