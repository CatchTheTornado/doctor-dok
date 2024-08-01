'use client'
import { AuthorizePopup } from "@/components/authorize-popup";
import PatientRecordsWrapper from "@/components/patient-records-wrapper";
import TopHeader from "@/components/top-header";
import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import { DatabaseContext, DatabaseContextProvider } from "@/contexts/db-context";
import {  PatientContextProvider } from "@/contexts/patient-context";
import { PatientRecordContextProvider } from "@/contexts/patient-record-context";
import { useContext } from "react";

export default function PatientPad() {
  const dbContext = useContext(DatabaseContext);
  return (
    <DatabaseContextProvider>
      <ConfigContextProvider>
        {dbContext?.authStatus.isAuthorized() ? (
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
        ) : (<AuthorizePopup />) }
      </ConfigContextProvider>
    </DatabaseContextProvider>
  );
}