import { useContext, useEffect, useState } from "react";
import PatientRecordItem from "./patient-record-item";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { PatientRecordContext } from "@/contexts/patient-record-context";
import { PatientContext } from "@/contexts/patient-context";
import DataLoader from "./data-loader";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { sort } from "fast-sort";
import { useEffectOnce } from "react-use";
import { ConfigContext } from "@/contexts/config-context";

export default function PatientRecordList({ patient }) {
  const patientRecordContext = useContext(PatientRecordContext);
  const patientContext = useContext(PatientContext);
  const [sortBy, setSortBy] = useState([ { desc: a => a.createdAt } ]);
  const [displayAttachmentPreviews, setDisplayAttachmentPreviews] = useState(false);
  const config = useContext(ConfigContext);

  useEffectOnce(() => {
    config?.getServerConfig('displayAttachmentPreviews').then((value) => {
      if (typeof value === "boolean") {
        setDisplayAttachmentPreviews(value as boolean);
      } else {
        setDisplayAttachmentPreviews(true); // default value
      }
    });
  });

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
            {sort(patientRecordContext?.patientRecords).by(sortBy).map((record, index) => (
              <PatientRecordItem key={index} record={record} displayAttachmentPreviews={displayAttachmentPreviews} />
            ))}
          </div>
        ) : (null) }
      </div>
    </div>
  );
}