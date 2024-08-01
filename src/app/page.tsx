'use client'
import PatientRecordsWrapper from "@/components/patient-records-wrapper";
import TopHeader from "@/components/top-header";
import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import { DatabaseContextProvider } from "@/contexts/db-context";
import {  PatientContextProvider } from "@/contexts/patient-context";
import { PatientRecordContextProvider } from "@/contexts/patient-record-context";

export default function PatientPad() {
  return (
    <DatabaseContextProvider>
      <ConfigContextProvider>
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
      </ConfigContextProvider>
    </DatabaseContextProvider>
  );
}