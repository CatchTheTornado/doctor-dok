import PatientRecord from "./patient-record";

export default function PatientRecordList({ patient }) {
  // TODO: Use PatientRecord Context here
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {/* {patient.notes.map((note, index) => (
          <PatientRecord key={index} {...note} />
        ))} */}
      </div>
    </div>
  );
}