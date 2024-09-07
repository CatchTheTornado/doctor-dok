import { Button } from "./ui/button";
import { SettingsPopup } from "@/components/settings-popup";
import FolderListPopup from "./folder-list-popup";
import RecordForm from "./record-form";
import { FolderContext } from "@/contexts/folder-context";
import { useContext, useEffect, useState } from "react";
import { Chat } from "./chat";
import { Edit3Icon, FolderIcon, FolderOpen, FoldersIcon, KeyIcon, LogOutIcon, MenuIcon, MenuSquareIcon, MessageCircleIcon, PlusIcon, SaveAllIcon, Settings2Icon, SettingsIcon, Share2Icon, UsersIcon, Wand2 } from "lucide-react";
import { DatabaseContext } from "@/contexts/db-context";
import { toast } from "sonner";
import { useTheme } from 'next-themes';
import SharedKeysPopup from "./shared-keys-popup";
import { KeyContext } from "@/contexts/key-context";
import { ChangeKeyPopup } from "./change-key-popup";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { ConfigContext } from "@/contexts/config-context";
import { ChatContext } from "@/contexts/chat-context";
import { RecordContext } from "@/contexts/record-context";
import { useEffectOnce } from "react-use";
import StatsPopup from "@/components/stats-popup";
import { RecordEditMode } from "@/components/record-form";
import ChatCommands from "@/components/chat-commands";

export default function TopHeader() {
    const folderContext = useContext(FolderContext);
    const dbContext = useContext(DatabaseContext);
    const keyContext = useContext(KeyContext);
    const chatContext = useContext(ChatContext);
    const recordContext = useContext(RecordContext);
    const config = useContext(ConfigContext);
    const { theme, systemTheme } = useTheme();
    const currentTheme = (theme === 'system' ? systemTheme : theme)
    const [commandDialogOpen, setCommandDialogOpen] = useState(false);
    const [chatCommandsOpen, setChatCommandsOpen] = useState(false);

    useEffectOnce(() => {
      chatContext.checkApiConfig();
    }); 
    return (
      <div className="sticky top-0 z-1000 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-200 dark:bg-zinc-800 h-12">
        <div className="font-medium flex justify-center items-center">
          <div><img className="h-14 w-14" src={currentTheme === 'dark' ? `/img/doctor-dok-logo-white.svg` : `/img/doctor-dok-logo.svg`} /></div>
          <div className="xs:hidden xxs:hidden sm:flex justify-center items-center sm:flex">Doctor Dok {folderContext?.currentFolder ? (<FolderOpen className="w-6 h-6 ml-2 mr-2"/>) : ''} {folderContext?.currentFolder?.displayName()} {folderContext?.currentFolder ? <Button className="ml-3" variant="outline" onClick={(e) => { folderContext?.setFolderListPopup(true); folderContext?.setFolderEditOpen(true); }}>Edit folder</Button> : null } </div>
        </div>
        <div className="flex items-center gap-2">
        <FolderListPopup />
          {(folderContext?.currentFolder !== null) ? (
            <RecordForm mode={RecordEditMode.Classic} folder={folderContext?.currentFolder} />
          ) : ("")}
          {(folderContext?.currentFolder !== null && (dbContext?.featureFlags.voiceRecorder)) ? (
            <RecordForm mode={RecordEditMode.VoiceRecorder} folder={folderContext?.currentFolder} />
          ) : ("")}
          {(folderContext?.currentFolder !== null) ? (
            <Chat />
          ) : ("")} 
            {(folderContext?.currentFolder !== null) ? (
            <Button variant="outline" size="icon" onClick={(e) => {
              setChatCommandsOpen(true);
            }}><Wand2 className="cursor-pointer w-6 h-6"/></Button>
          ) : ("")}
            <ChatCommands open={chatCommandsOpen} setOpen={setChatCommandsOpen} />


            <StatsPopup />
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<SharedKeysPopup />) : null}
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<SettingsPopup />) : null}
            {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<ChangeKeyPopup />) : null}

            <Button variant="outline" size="icon" onClick={() => { setCommandDialogOpen(true); }}>
              <MenuIcon className="cursor-pointer w-6 h-6"/>
            </Button>
            <CommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
              <CommandInput className="cursor-pointer text-sm" placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                  <CommandItem key="cmd-edit-folder" className="cursor-pointer text-xs"  onSelect={(e) => { recordContext?.setRecordEditMode(true); }}><PlusIcon /> Add record</CommandItem>
                  {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<CommandItem key="cmd-settings" className="cursor-pointer text-xs" onSelect={(v) => { config?.setConfigDialogOpen(true);  }}><Settings2Icon className="w-6 h-6" />  Settings</CommandItem>) : null}
                    <CommandItem key="cmd-list-folders" className="cursor-pointer text-xs"  onSelect={(e) => { folderContext?.setFolderListPopup(true); folderContext?.setFolderEditOpen(false); }}><FoldersIcon /> List folders</CommandItem>
                    <CommandItem key="cmd-edit-current-folder" className="cursor-pointer text-xs"  onSelect={(e) => { folderContext?.setFolderListPopup(true); folderContext?.setFolderEditOpen(true); }}><Edit3Icon /> Edit currrent folder</CommandItem>
                    <CommandItem key="cmd-open-chat" className="cursor-pointer text-xs"  onSelect={(e) => { chatContext?.setChatOpen(true); }}><MessageCircleIcon /> Open AI Chat</CommandItem>

                    {!dbContext?.acl || dbContext.acl.role === 'owner' ? (<CommandItem key="cmd-share" className="cursor-pointer text-xs" onSelect={(v) => { keyContext.setSharedKeysDialogOpen(true);  }}><Share2Icon className="w-6 h-6" />  Shared Keys</CommandItem>) : null}
                  </CommandGroup>
                  <CommandGroup heading="Export & import">
                    <CommandItem key="cmd-export" className="cursor-pointer text-xs" onSelect={(v) => { recordContext?.exportRecords(); }}><SaveAllIcon className="w-6 h-6" /> Export filtered records</CommandItem>
                    {/* <CommandItem key="cmd-import" className="cursor-pointer text-xs" onSelect={(v) => { recordContext?.importRecords(); }}><UsersIcon className="w-6 h-6" /> Import records</CommandItem> */}
                  </CommandGroup>                  
                  <CommandGroup heading="Security">
                    <CommandItem key="cmd-change-key" className="cursor-pointer text-xs" onSelect={(v) => { keyContext.setChangeEncryptionKeyDialogOpen(true);  }}><KeyIcon className="w-6 h-6" /> Change encryption key</CommandItem>
                    <CommandItem key="cmd-logout" className="cursor-pointer text-xs" onSelect={(v) => { dbContext?.logout(); }}><LogOutIcon className="w-6 h-6" /> Logout</CommandItem>
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