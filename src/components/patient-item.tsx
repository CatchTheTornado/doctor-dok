import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function PatientItem({ href, avatarSrc, avatarFallback, name, lastVisit }) {
  return (
    <Link
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      href={href}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage alt="Patient" src={avatarSrc} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last visit: {lastVisit}</div>
      </div>
    </Link>
  );
}