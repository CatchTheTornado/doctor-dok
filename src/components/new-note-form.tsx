import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "./icons";

export default function NewNoteForm() {
  return (
    <div className="mt-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <Textarea
          className="flex-1 resize-none border-none focus:ring-0"
          placeholder="Add a new note..."
          rows={2}
        />
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Note type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="memo">Memo</SelectItem>
            <SelectItem value="visit">Visit</SelectItem>
            <SelectItem value="results">Results</SelectItem>
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost">
          <PaperclipIcon className="w-4 h-4" />
        </Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}
