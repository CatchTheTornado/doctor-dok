"use client"

import { useContext, useEffect, useState } from "react"
import { Credenza, CredenzaTrigger, CredenzaContent, CredenzaFooter } from "@/components/credenza"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfigContext } from "@/contexts/config-context"
import { PasswordInput } from "./ui/password-input"
import { generateEncryptionKey } from "@/lib/crypto"
import ReactToPrint from "react-to-print";
import { KeyPrint } from "./key-print"
import React from "react"
import { DatabaseAuthStatus } from "@/data/client/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { DatabaseContext } from "@/contexts/db-context";

export function AuthorizePopup() {
  const config = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
  }, [dbContext?.authStatus.status]);

  async function onSubmitAuthorize(formData) {
  }

  async function onSubmitCreate(formData) {
  }

  return (
    <div className="p-4">
        <Tabs defaultValue="authorize">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authorize">Open database</TabsTrigger>
            <TabsTrigger value="create">Create database</TabsTrigger>
          </TabsList>
          <TabsContent value="authorize">
            <Card>
              <CardHeader>
                <CardTitle>Open database</CardTitle>
                <CardDescription>
                  Provide the "Databse ID" and "Key" to authorize and open database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create database</CardTitle>
                <CardDescription>
                  
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                Create
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}


