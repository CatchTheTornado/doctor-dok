import { useEffect, useState } from "react";

export function useDocumentVisibility() {
    const [isDocumentVisible, setIsDocumentVisible] = useState(!document.hidden);
  
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };
  
    useEffect(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);
  
    return isDocumentVisible;
  }