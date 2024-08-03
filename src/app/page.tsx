'use client'
import { AuthorizePopup } from "@/components/authorize-popup";
import TopHeader from "@/components/top-header";
// import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import { DatabaseContext, DatabaseContextProvider } from "@/contexts/db-context";
import {  } from "@/contexts/patient-context";
//import { PatientRecordContextProvider } from "@/contexts/patient-record-context";
import { useContext } from "react";
import dynamic from "next/dynamic";

// part of bundle size optimization (https://github.com/CatchTheTornado/patient-pad/issues/67)
const DynamicPatientRecordsWrapper = dynamic(() => import('@/components/patient-records-wrapper'), { ssr: false });
const DynamicPatientRecordContextProvider = dynamic(() => import('@/contexts/patient-record-context'), { ssr: false });
const DynamicChatContextProvider = dynamic(() => import('@/contexts/chat-context'), { ssr: false });
const DynamicPatientContextProvider = dynamic(() => import('@/contexts/patient-context'), { ssr: false });

export default function PatientPad() {
  const dbContext = useContext(DatabaseContext);
  return (
    <DatabaseContextProvider>
      <ConfigContextProvider>
        {dbContext?.authStatus.isAuthorized() ? (
          <DynamicPatientContextProvider>
            <DynamicPatientRecordContextProvider>
              <DynamicChatContextProvider>
                <div>
                  <TopHeader />
                  <DynamicPatientRecordsWrapper />
                </div>
              </DynamicChatContextProvider>
            </DynamicPatientRecordContextProvider>
          </DynamicPatientContextProvider>
        ) : (<AuthorizePopup />) }
      </ConfigContextProvider>
    </DatabaseContextProvider>
  );
}