'use client'
import PatientList from "@/components/patient-list";
import PatientRecords from "@/components/patient-records";
import NewPatientRecord from "@/components/patient-record-form";
import PatientsTopHeader from "@/components/patient-pane-header";
import { ConfigContext, ConfigContextProvider } from "@/contexts/config-context";
import { useContext, useEffect } from "react";
import { PatientApiClient } from "@/data/client/patient-api-client";
import { ApiEncryptionConfig } from "@/data/client/base-api-client";
import { PatientDTO } from "@/data/dto";
import { getCurrentTS } from "@/lib/utils";

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
  useEffect(() => {
    (async () => {
      const encryptionConfig: ApiEncryptionConfig = {
        secretKey: "SecretKeyTest", // TODO: for entities other than Config we should take the masterKey from server config
        useEncryption: true
      };
      const client = new PatientApiClient('', encryptionConfig);
    
      try {
        const patients = await client.get();
        console.log('Patients:', patients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    
      const newPatient: PatientDTO = {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        updatedAt: getCurrentTS()
        // Populate other necessary fields
      };
    
      try {
        const response = await client.put(newPatient);
        if (response.status === 200) {
          console.log('Patient updated:', response.data);
        } else {
          console.error('Error updating patient:', response.message);
          if (response.issues) {
            console.error('Validation issues:', response.issues);
          }
        }
      } catch (error) {
        console.error('Error updating patient:', error);
      }
    })();    
  });

  return (
    <ConfigContextProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <PatientsTopHeader />
          <PatientList />    
        </div>
        <div className="p-6 flex flex-col">
          <NewPatientRecord patient={patients[0]} />
          <div className="flex-1 overflow-auto">
            <div className="grid gap-6">
              <PatientRecords key={0} patient={patients[0]} />
            </div>
          </div>
        </div>
      </div>
    </ConfigContextProvider>
  );
}