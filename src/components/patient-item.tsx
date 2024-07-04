import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Patient } from "@/data/client/models";

export default function PatientItem({ patient, selected, onClick }: { patient: Patient, selected: boolean, onClick: (e: any) => void}) {

  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-gray-100 dark:bg-gray-800" : "" } transition-colors over:bg-gray-100 dark:hover:bg-gray-800`}
      href=""
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarFallback>{patient.avatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{patient.displayName()}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Date of birth: {patient.displatDateOfBirth()}</div>
      </div>
    </Link>
  );
}