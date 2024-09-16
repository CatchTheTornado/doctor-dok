"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { AuthorizeDatabaseForm } from "./authorize-database-form";
import { CreateDatabaseForm } from "./create-database-form";
import { useContext, useEffect, useState } from 'react';
import DataLoader from './data-loader';
import { useTheme } from 'next-themes';
import { SaaSContext } from '@/contexts/saas-context';

export function AuthorizePopup({ autoLoginInProgress }: { autoLoginInProgress: boolean }) {
  const [applicationLoaded, setApplicationLoaded] = useState(false);
  const { theme, systemTheme } = useTheme();
  const currentTheme = (theme === 'system' ? systemTheme : theme)
  const saasContext = useContext(SaaSContext);

  useEffect(() => {
    setApplicationLoaded(true);
  },[]);
  return (
    <div className="p-4 grid items-center justify-center h-screen">
     {!applicationLoaded || autoLoginInProgress ? (<div className="w-96 flex items-center justify-center flex-col"><div className="flex-row h-40 w-40"><img src="/img/doctor-dok-logo.svg" /></div><div><DataLoader /></div></div>):(
      <div>
        {saasContext?.email ? (
          <div className="flex">
            Hello {saasContext?.email}! Welcome to Doctor Dok's Beta Tests. You can create: {saasContext?.quota.allowedDatabases} database(s).
          </div>
        ): (null)}
        <div className="flex">
          <img alt="Application logo" className="w-20" src={currentTheme === 'dark' ? `/img/doctor-dok-logo-white.svg` : `/img/doctor-dok-logo.svg`} />
          <h1 className="text-5xl text-center p-8 pl-0">Doctor Dok</h1>
        </div>
        <Tabs defaultValue="authorize" className="w-96">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="authorize" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">Open database</TabsTrigger>
            <TabsTrigger value="create" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">Create database</TabsTrigger>
          </TabsList>
          <TabsContent value="authorize" className="max-w-600">
            <Card>
              <CardHeader>
                <CardDescription>
                  Open Database by <strong>Database Id</strong> and <strong>Key</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AuthorizeDatabaseForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardDescription>
                   Create New Encrypted Database. <strong>Please store your Database Id and Key</strong> in a safe place as it <strong>will not be recoverable</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CreateDatabaseForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
        )}
    </div>
  )
}