'use client'
import { AuthorizePopup } from "@/components/authorize-popup";
import TopHeader from "@/components/top-header";
// import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import { DatabaseContext, DatabaseContextProvider } from "@/contexts/db-context";
import { PatientContextProvider } from "@/contexts/patient-context";
//import { PatientRecordContextProvider } from "@/contexts/patient-record-context";
import { useContext } from "react";
import dynamic from "next/dynamic";
import { DatabaseAuthStatus } from "@/data/client/models";
import AuthorizationGuard from "@/components/AuthorizationGuard";
import { PatientRecordContextProvider } from "@/contexts/patient-record-context";
import { ChatContextProvider } from "@/contexts/chat-context";
import PatientRecordsWrapper from "@/components/patient-records-wrapper";

// part of bundle size optimization (https://github.com/CatchTheTornado/patient-pad/issues/67)
// const DynamicPatientRecordsWrapper = dynamic(() => import('@/components/patient-records-wrapper'), { ssr: false });
// const DynamicPatientRecordContextProvider = dynamic(() => import('@/contexts/patient-record-context'), { ssr: false });
// const DynamicChatContextProvider = dynamic(() => import('@/contexts/chat-context'), { ssr: false });
// const DynamicPatientContextProvider = dynamic(() => import('@/contexts/patient-context'), { ssr: false });

export default function PatientPad() {
  return (
    <DatabaseContextProvider>
      <ConfigContextProvider>
        <AuthorizationGuard>
          <PatientContextProvider>
              <PatientRecordContextProvider>
                <ChatContextProvider>
                  <div>
                    <TopHeader />
                    <PatientRecordsWrapper />
                  </div>
                </ChatContextProvider>
              </PatientRecordContextProvider>
            </PatientContextProvider>
        </AuthorizationGuard> 
      </ConfigContextProvider>
    </DatabaseContextProvider>
  );
}