'use client'
import PatientRecordsWrapper from "@/components/patient-records-wrapper";
import TopHeader from "@/components/top-header";
import { ChatContextProvider } from "@/contexts/chat-context";
import { ConfigContextProvider } from "@/contexts/config-context";
import {  PatientContextProvider } from "@/contexts/patient-context";
import { PatientRecordContextProvider } from "@/contexts/patient-record-context";

export default function PatientPad() {
  return (
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
  );
}