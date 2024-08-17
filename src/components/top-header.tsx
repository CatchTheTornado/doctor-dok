import { Button } from "./ui/button";
import { SettingsPopup } from "@/components/settings-popup";
import PatientListPopup from "./patient-list-popup";
import PatientRecordForm from "./patient-record-form";
import { PatientContext } from "@/contexts/patient-context";
import { useContext, useState } from "react";
import { Chat } from "./chat";
import { KeyIcon, LogOutIcon, MenuIcon, MenuSquareIcon, Settings2Icon, SettingsIcon, Share2Icon } from "lucide-react";
import { DatabaseContext } from "@/contexts/db-context";
import { toast } from "sonner";
import { useTheme } from 'next-themes';
import SharedKeysPopup from "./shared-keys-popup";
import { KeyContext } from "@/contexts/key-context";
import { ChangeKeyPopup } from "./change-key-popup";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { ConfigContext } from "@/contexts/config-context";

export default function TopHeader() {
    const patientContext = useContext(PatientContext);
    const dbContext = useContext(DatabaseContext);
    const keyContext = useContext(KeyContext);
    const config = useContext(ConfigContext);
    const { theme, systemTheme } = useTheme();
    const currentTheme = (theme === 'system' ? systemTheme : theme)
    const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  
    return (
      <div className="sticky top-0 z-1000 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-200 dark:bg-zinc-800 h-12">
        <div className="font-medium flex justify-center items-center">
          <div><img className="h-12" src={currentTheme === 'dark' ? `/img/patient-pad-logo-white.svg` : `/img/patient-pad-logo.svg`} /></div>
          <div>{patientContext?.currentPatient ? <Button className="ml-3" variant="outline" onClick={(e) => { patientContext?.setPatientListPopup(true); patientContext?.setPatientEditOpen(true); }}>Edit patient</Button> : null}</div>
        </div>
        <div className="flex items-center gap-2">
          <PatientListPopup />
          {(patientContext?.currentPatient !== null) ? (
            <PatientRecordForm patient={patientContext?.currentPatient} />
          ) : ("")}
          {(patientContext?.currentPatient !== null) ? (
            <Chat />
          ) : ("")}     
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<SharedKeysPopup />) : null}
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<SettingsPopup />) : null}
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<ChangeKeyPopup />) : null}

            <Button variant="outline" size="icon" onClick={() => { setCommandDialogOpen(true); }}>
              <MenuIcon className="cursor-pointer w-6 h-6"/>
            </Button>
            <CommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
              <CommandInput className="text-sm" placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<CommandItem key="cmd-share" className="text-xs" onSelect={(v) => { keyContext.setSharedKeysDialogOpen(true);  }}><Share2Icon className="w-6 h-6" />  Shared Keys</CommandItem>) : null}
                    {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<CommandItem key="cmd-settings" className="text-xs" onSelect={(v) => { config?.setConfigDialogOpen(true);  }}><Settings2Icon className="w-6 h-6" />  Settings</CommandItem>) : null}
                    {!dbContext?.acl || dbContext.acl.role !== 'guest' ? (<CommandItem key="cmd-change-key" className="text-xs" onSelect={(v) => { keyContext.setChangeEncryptionKeyDialogOpen(true);  }}><KeyIcon className="w-6 h-6" />  Change Encryption Key</CommandItem>) : null}
                    <CommandItem key="cmd-logout" className="text-xs" onSelect={(v) => { dbContext?.logout(); localStorage.removeItem('keepLoggedIn'); toast.info("Logged out successfully"); }}><LogOutIcon className="w-6 h-6" />  Logout</CommandItem>
                  </CommandGroup>
              </CommandList>
            </CommandDialog>
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