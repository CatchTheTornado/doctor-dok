import PatientRecord from "./patient-record";
import { NoRecordsAlert } from "./shared/no-records-alert";

export default function PatientRecordList({ patient }) {
  // TODO: Use PatientRecord Context here
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {/* {patient.notes.map((note, index) => (
          <PatientRecord key={index} {...note} />
        ))} */}
        <NoRecordsAlert title="No health records found">
          No health records found in the database. Please add a new patient using "+" icon above.
        </NoRecordsAlert>        
      </div>
    </div>
  );
}