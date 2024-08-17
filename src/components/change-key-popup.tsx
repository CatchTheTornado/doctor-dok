"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { AuthorizeDatabaseForm } from "./authorize-database-form";
import { CreateDatabaseForm } from "./create-database-form";
import { useContext, useEffect, useState } from 'react';
import DataLoader from './data-loader';
import { useTheme } from 'next-themes';
import { ChangeKeyForm } from './change-key-form';
import { Credenza, CredenzaContent, CredenzaTrigger } from './credenza';
import { KeyContext } from '@/contexts/key-context';
import { KeyIcon, SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';

export function ChangeKeyPopup({}) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = (theme === 'system' ? systemTheme : theme)
  const keysContext = useContext(KeyContext);

  useEffect(() => {
  },[]);

  return (
    <Credenza open={keysContext?.changeEncryptionKeyDialogOpen} onOpenChange={keysContext?.setChangeEncryptionKeyDialogOpen}>
      <CredenzaContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950">
        <div className="p-4 grid items-center justify-center">
          <ChangeKeyForm />
        </div>
      </CredenzaContent>
    </Credenza>
  )
}