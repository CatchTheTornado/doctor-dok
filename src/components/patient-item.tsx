import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Patient } from "@/data/client/models";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { PatientContext } from "@/contexts/patient-context";

export default function PatientItem({ patient, selected, onClick }: { patient: Patient, selected: boolean, onClick: (e: any) => void}) {
  const patientContext = useContext(PatientContext);

  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-zinc-100 dark:bg-zinc-800" : "" } transition-colors over:bg-zinc-100 dark:hover:bg-zinc-800`}
      href=""
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarFallback>{patient.avatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{patient.displayName()}</div>
          <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">Date of birth: {patient.displatDateOfBirth()}</div>
      </div>
      <div className="w-10">
            <Button variant="ghost" size="icon" className="text-xs right-0 relative" onClick={
              (e) => {
                e.preventDefault();
                e.stopPropagation();
                patientContext?.deletePatient(patient);
              }
            }><Trash2Icon /></Button>
      </div>
              
    </Link>
  );
}