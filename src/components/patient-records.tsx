import { useContext } from "react";
import NewPatientRecord from "./patient-record-form";
import PatientRecordList from "./patient-record-list";
import { PatientContext } from "@/contexts/patient-context";

export default function PatientRecords({}) {
  const patientContext = useContext(PatientContext);
  return (
      <div className="p-6 flex flex-col">
      { (patientContext?.currentPatient !== null) ? (
        <div>
          <NewPatientRecord patient={patientContext?.currentPatient} />
          <div className="flex-1 overflow-auto">
            <div className="grid gap-6">
              <PatientRecordList key={0} patient={patientContext?.currentPatient} />
            </div>
          </div>
        </div>
      ) : ("") }
    </div>
  )
}