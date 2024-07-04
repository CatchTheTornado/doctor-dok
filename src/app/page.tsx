'use client'
import PatientList from "@/components/patient-list-popup";
import PatientRecordsWrapper from "@/components/patient-records-wrapper";
import NewPatientRecord from "@/components/patient-record-form";
import TopHeader from "@/components/top-header";
import { ConfigContext, ConfigContextProvider } from "@/contexts/config-context";
import { useContext } from "react";
import { PatientContext, PatientContextProvider } from "@/contexts/patient-context";
import { DataLinkStatus } from "@/data/client/models";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function PatientPad() {
  const patientContext = useContext(PatientContext)

  return (
    <ConfigContextProvider>
      <PatientContextProvider>
        <div>
          <TopHeader />
          <PatientRecordsWrapper />
        </div>
      </PatientContextProvider>
    </ConfigContextProvider>
  );
}