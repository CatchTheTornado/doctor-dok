import { useContext, useEffect } from "react";
import PatientRecordItem from "./patient-record-item";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { PatientContext } from "@/contexts/patient-context";
import DataLoader from "./data-loader";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export default function PatientRecordList({ patient }) {
  const patientRecordContext = useContext(PatientRecordContext);
  const patientContext = useContext(PatientContext);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        { (patientRecordContext?.loaderStatus === "loading") ? (
          <div className="flex justify-center">
            <DataLoader />
          </div>
        ) : (null) }
        { (patientRecordContext?.loaderStatus === "error") ? (
          <Alert status="error">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Error while loading patient records. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (null) }
        { (patientRecordContext?.loaderStatus === "success" && patientRecordContext?.patientRecords.length === 0) ? (
          <NoRecordsAlert title="No health records found">
            No health records found in the database. Please add a new patient using "+" icon above.
          </NoRecordsAlert>
        ) : (null) }
        { (patientRecordContext?.loaderStatus === "success" && patientRecordContext?.patientRecords.length > 0) ? (
          <div className="space-y-4">
            {patientRecordContext?.patientRecords.map((record, index) => (
              <PatientRecordItem key={index} {...record} />
            ))}
          </div>
        ) : (null) }
      </div>
    </div>
  );
}