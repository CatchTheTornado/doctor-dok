import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Key } from "@/data/client/models";
import { Button } from "./ui/button";
import { useContext } from "react";
import { KeyContext } from "@/contexts/key-context";

export default function SharedKeyItem({ sharedKey, selected, onClick }: { sharedKey: Key, selected: boolean, onClick: (e: any) => void}) {
  const keysContext = useContext(KeyContext);
  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-zinc-100 dark:bg-zinc-800" : "" } transition-colors over:bg-zinc-100 dark:hover:bg-zinc-800`}
      href=""
      onClick={onClick}
    >
      <div className="grid grid-cols-3 w-full">
        <div className="font-medium">{sharedKey.displayName}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">Expiry date: {sharedKey.expiryDate ? new Date(sharedKey.expiryDate as string).toLocaleString(): 'never'} {sharedKey.expiryDate && new Date(sharedKey.expiryDate as string).getTime() < Date.now() ? (<span className="text-red-500">expired!</span>) : null}</div>
        <div className="text-sm items-end">
          <Button onClick={(e) => {
            keysContext.removeKey(sharedKey.keyLocatorHash);
          }}>Revoke key</Button>
        </div>
      </div>
    </Link>
  );
}