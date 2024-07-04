import { Button } from "./ui/button";
import { PatientEditPopup } from "@/components/patient-edit-popup";
import { SettingsPopup } from "@/components/settings-popup";
import PatientListPopup from "./patient-list-popup";

export default function TopHeader() {

    return (
      <div className="sticky top-0 z-1000 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-200 dark:bg-zinc-800">
        <div className="font-medium">Patient Pad</div>
        <div className="flex items-center gap-2">
          <PatientListPopup />
          <SettingsPopup />
          <Button variant="ghost" size="icon">
            <LogInIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
}

function LogInIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" x2="3" y1="12" y2="12" />
      </svg>
    )
  }