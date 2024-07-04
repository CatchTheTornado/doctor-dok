import { Input } from "@/components/ui/input";

export default function PatientSearch() {
  return (
    <div className="sticky top-0 p-4 border-b border-zinc-200 dark:border-zinc-800">
      <Input
        className="w-full rounded-md bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-0"
        placeholder="Search patients..."
      />
    </div>
  );
}