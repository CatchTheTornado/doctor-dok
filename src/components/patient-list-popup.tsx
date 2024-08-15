import { useContext, useState } from "react";
import PatientItem from "./patient-item";
import { PatientContext } from "@/contexts/patient-context";
import { DatabaseAuthStatus, DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";
import { ConfigContext } from "@/contexts/config-context";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ListIcon, Terminal } from "lucide-react";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { Button } from "./ui/button";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { PatientEditPopup } from "./patient-edit-popup";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { DatabaseContext } from "@/contexts/db-context";

export default function PatientListPopup() {
  const dbContext = useContext(DatabaseContext);
  const patientsContext = useContext(PatientContext)

  return (
    <Credenza open={patientsContext?.patientListPopup} onOpenChange={patientsContext?.setPatientListPopup}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <ListIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950" side="top">
        <CredenzaHeader>
          <CredenzaTitle>List patients
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <PatientEditPopup />
            ) : (null)}
          </CredenzaTitle>
          <CredenzaDescription>
            Select patient to work on
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="h-auto overflow-auto">
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <div className="p-4 space-y-4">
                {patientsContext?.loaderStatus === DataLoadingStatus.Loading ? (
                  <div className="flex justify-center">
                    <DataLoader />
                  </div>
                ) : (
                  (patientsContext?.patients.length > 0) ?
                    patientsContext?.patients.map((patient, index) => (
                      <PatientItem onClick={(e) => { e.preventDefault(); patientsContext?.setPatientListPopup(false); patientsContext.setCurrentPatient(patient); }} key={index} patient={patient} selected={patientsContext?.currentPatient?.id === patient.id} />
                    ))
                    : (
                      <NoRecordsAlert title="No patients found">
                        No patients found in the database. Please add a new patient using "+" icon above.
                      </NoRecordsAlert>
                    )
                )}
              </div>
            ) : (
              <DatabaseLinkAlert />
            )}
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}