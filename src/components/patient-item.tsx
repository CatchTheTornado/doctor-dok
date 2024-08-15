import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Patient } from "@/data/client/models";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { PatientContext } from "@/contexts/patient-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

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
      <div className="flex-1" onClick={(e) => { e.preventDefault(); patientContext?.setPatientListPopup(false); patientContext.setCurrentPatient(patient); }} >
        <div className="font-medium">{patient.displayName()}</div>
          <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">Date of birth: {patient.displatDateOfBirth()}</div>
      </div>
      <div className="w-10">

      <AlertDialog>
          <AlertDialogTrigger>
            <Button size="icon" variant="ghost" title="Delete record">
              <Trash2Icon className="w-4 h-4"/>
            </Button>            
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-zinc-950">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your patient data (in case it does not has any health records assigned)
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => 
                {
                  patientContext?.deletePatient(patient);
                }
              }>YES</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>       
      </div>
             
    </Link>
  );
}