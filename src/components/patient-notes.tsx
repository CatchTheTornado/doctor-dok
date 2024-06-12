import Note from "./note";

export default function PatientNotes({ patient }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">{patient.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last visit: {patient.lastVisit}</div>
      </div>
      <div className="mt-4 space-y-4">
        {patient.notes.map((note, index) => (
          <Note key={index} {...note} />
        ))}
      </div>
    </div>
  );
}