import { Button } from "@/components/ui/button";
import { PaperclipIcon, Trash2Icon } from "./icons";

export default function PatientRecord({ title, date, content }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
      </div>
      <div className="mt-2 text-sm">{content}</div>
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