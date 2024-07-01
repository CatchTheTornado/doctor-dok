import { useContext } from "react";
import PatientItem from "./patient-item";
import { PatientContext } from "@/contexts/patient-context";

export default function PatientList() {
  const patientsContext = useContext(PatientContext)
  return (
    <div className="h-[calc(100vh-64px)] overflow-auto">
      <div className="p-4 space-y-4">
        {patientsContext?.patients.map((patient, index) => (
          <PatientItem key={index} {...patient} />
        ))}
      </div>
    </div>
  );
}