'use client'
import PatientSearch from "@/components/patient-search";
import PatientList from "@/components/patient-list";
import PatientRecords from "@/components/patient-records";
import NewPatientRecord from "@/components/patient-record-form";
import useConfig from "@/lib/config";

export default function PatientPad() {
  const config = useConfig();
  
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

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <PatientSearch />
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
  );
}