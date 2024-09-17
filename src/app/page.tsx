'use client'
import TopHeader from "@/components/top-header";
// import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import {  DatabaseContextProvider } from "@/contexts/db-context";
import { FolderContextProvider } from "@/contexts/folder-context";
//import { RecordContextProvider } from "@/contexts/record-context";
import AuthorizationGuard from "@/components/authorization-guard";
import { RecordContextProvider } from "@/contexts/record-context";
import { ChatContextProvider } from "@/contexts/chat-context";
import RecordsWrapper from "@/components/records-wrapper";
import { KeyContextProvider } from "@/contexts/key-context";
import { AuditContext, AuditContextProvider } from "@/contexts/audit-context";
import { TermsContext, TermsContextProvider } from "@/contexts/terms-context";
import TermsPopup from "@/components/terms";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SaaSContext, SaaSContextProvider } from "@/contexts/saas-context";

// part of bundle size optimization (https://github.com/CatchTheTornado/doctor-dok/issues/67)
// const DynamicRecordsWrapper = dynamic(() => import('@/components/records-wrapper'), { ssr: false });
// const DynamicRecordContextProvider = dynamic(() => import('@/contexts/record-context'), { ssr: false });
// const DynamicChatContextProvider = dynamic(() => import('@/contexts/chat-context'), { ssr: false });
// const DynamicFolderContextProvider = dynamic(() => import('@/contexts/folder-context'), { ssr: false });

export default function FolderPad() {
  return (
    <SaaSContextProvider>
      <DatabaseContextProvider>
       <ConfigContextProvider>
          <AuditContextProvider>
            <TermsContextProvider>
              <AuthorizationGuard>
                <ChatContextProvider>
                  <FolderContextProvider>
                    <RecordContextProvider>
                      <KeyContextProvider>
                        <div>
                          <TopHeader />
                          <TermsPopup />
                          <RecordsWrapper />
                        </div>
                      </KeyContextProvider>
                    </RecordContextProvider>
                  </FolderContextProvider>
                </ChatContextProvider>
              </AuthorizationGuard> 
            </TermsContextProvider>
          </AuditContextProvider>
        </ConfigContextProvider>
      </DatabaseContextProvider>
    </SaaSContextProvider>
  );
}