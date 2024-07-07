import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";
import { PatientRecord } from "@/data/client/models";

export default function PatientRecordItem(record: PatientRecord) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{record.type}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{record.createdAt}</div>
      </div>
      <div className="mt-2 text-sm">{record.description}</div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <PaperclipIcon className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}