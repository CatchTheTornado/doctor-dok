import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Folder } from "@/data/client/models";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { FolderContext } from "@/contexts/folder-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

export default function FolderItem({ folder, selected, onClick }: { folder: Folder, selected: boolean, onClick: (e: any) => void}) {
  const folderContext = useContext(FolderContext);

  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-zinc-100 dark:bg-zinc-800" : "" } transition-colors over:bg-zinc-100 dark:hover:bg-zinc-800`}
      href=""
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarFallback>{folder.avatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="flex-1" onClick={(e) => { e.preventDefault(); folderContext?.setFolderListPopup(false); folderContext.setCurrentFolder(folder); }} >
        <div className="font-medium">{folder.displayName()}</div>
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
                This action cannot be undone. This will permanently delete your folder data (in case it does not has any records assigned)
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => 
                {
                  folderContext?.deleteFolder(folder);
                }
              }>YES</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>       
      </div>
             
    </Link>
  );
}