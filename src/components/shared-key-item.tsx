import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Key } from "@/data/client/models";
import { Button } from "./ui/button";

export default function SharedKeyItem({ sharedKey, selected, onClick }: { sharedKey: Key, selected: boolean, onClick: (e: any) => void}) {

  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-zinc-100 dark:bg-zinc-800" : "" } transition-colors over:bg-zinc-100 dark:hover:bg-zinc-800`}
      href=""
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="font-medium">{sharedKey.displayName}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Expiry date: {sharedKey.expiryDate}</div>
        <div className="text-sm">
          <Button>Revoke key</Button>
        </div>
      </div>
    </Link>
  );
}