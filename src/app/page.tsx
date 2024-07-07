'use client'
import PatientRecordsWrapper from "@/components/patient-records-wrapper";
import TopHeader from "@/components/top-header";
import { ConfigContextProvider } from "@/contexts/config-context";
import {  PatientContextProvider } from "@/contexts/patient-context";
import { PatientRecordContextProvider } from "@/contexts/patient-record-context";

export default function PatientPad() {
  return (
    <ConfigContextProvider>
      <PatientContextProvider>
        <PatientRecordContextProvider>
          <div>
            <TopHeader />
            <PatientRecordsWrapper />
          </div>
        </PatientRecordContextProvider>
      </PatientContextProvider>
    </ConfigContextProvider>
  );
}