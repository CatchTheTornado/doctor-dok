import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Patient } from "@/data/client/models";

export default function PatientItem({ patient }: { patient: Patient }) {
  return (
    <Link
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      href=""
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