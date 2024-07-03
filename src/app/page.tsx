'use client'
import PatientList from "@/components/patient-list";
import PatientRecords from "@/components/patient-records";
import NewPatientRecord from "@/components/patient-record-form";
import PatientsTopHeader from "@/components/patient-pane-header";
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
        <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-950">
          <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <PatientsTopHeader />
            <PatientList />
          </div>
          <PatientRecords />
        </div>
      </PatientContextProvider>
    </ConfigContextProvider>
  );
}