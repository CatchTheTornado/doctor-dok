'use client'
import PatientList from "@/components/patient-list";
import PatientRecords from "@/components/patient-records";
import NewPatientRecord from "@/components/patient-record-form";
import PatientsTopHeader from "@/components/patient-pane-header";
import { ConfigContext, ConfigContextProvider } from "@/contexts/config-context";
import { useContext } from "react";
import { useEffectOnce } from "react-use";
import { PatientContext, PatientContextProvider } from "@/contexts/patient-context";
import { DBStatus } from "@/data/client/models";
import { Toaster } from "sonner";

export default function PatientPad() {
  const patients = [
    {
      name: "John Doe",
      lastVisit: "2 days ago",
      notes: [
        { title: "Memo", date: "2 days ago", content: "Patient reported mild headache and fatigue. Recommended over-the-counter medication and follow-up in 3 days." },
        { title: "Visit", date: "1 week ago", content: "Routine checkup. Patient is in good health. Recommended annual follow-up." },
      ],
    }
  ];

  const configContext = useContext(ConfigContext);
  const patientContext = useContext(PatientContext)

  return (
    <ConfigContextProvider>
      <PatientContextProvider>
        <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-950">
          <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <PatientsTopHeader />
            { configContext?.dbStatus?.status === DBStatus.Authorized ? (
              <PatientList />    
            ) : ""}

          </div>
          {configContext?.dbStatus?.status === DBStatus.Authorized && patientContext?.currentPatient ? (
            <div className="p-6 flex flex-col">
              <NewPatientRecord patient={patientContext?.currentPatient} />
              <div className="flex-1 overflow-auto">
                <div className="grid gap-6">
                  <PatientRecords key={0} patient={patients[0]} />
                </div>
              </div>
            </div>
          ) : ""}
        </div>
      </PatientContextProvider>
    </ConfigContextProvider>
  );
}