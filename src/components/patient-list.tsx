import { useContext } from "react";
import PatientItem from "./patient-item";
import { PatientContext } from "@/contexts/patient-context";
import { DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";

export default function PatientList() {
  const patientsContext = useContext(PatientContext)
  return (
    <div className="h-[calc(100vh-64px)] overflow-auto">
      <div className="p-4 space-y-4">
      {patientsContext?.loaderStatus === DataLoadingStatus.Loading ? (
          <div className="flex justify-center">
            <DataLoader />
          </div>
        ) : (
          patientsContext?.patients.map((patient, index) => (
            <PatientItem key={index} patient={patient} />
          )) 
        )}
      </div>
    </div>
  );
}