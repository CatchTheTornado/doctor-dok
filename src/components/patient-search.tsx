import { Input } from "@/components/ui/input";

export default function PatientSearch() {
  return (
    <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-800">
      <Input
        className="w-full rounded-md bg-gray-100 dark:bg-gray-800 border-none focus:ring-0"
        placeholder="Search patients..."
      />
    </div>
  );
}