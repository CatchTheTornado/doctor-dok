import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Key } from "@/data/client/models";
import { Button } from "./ui/button";
import { useContext } from "react";
import { KeyContext } from "@/contexts/key-context";
import { AuditDTO } from "@/data/dto";
import { AuditContext } from "@/contexts/audit-context";
import { DatabaseContext } from "@/contexts/db-context";
import { Terminal } from "lucide-react";
import JsonViewEditor from "@uiw/react-json-view/editor";
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import { useTheme } from "next-themes";

export default function AuditLogItem({ audit, selected, onClick }: { audit: AuditDTO, selected: boolean, onClick: (e: any) => void}) {
  const keysContext = useContext(KeyContext);
  const auditContext = useContext(AuditContext )
  const dbContext = useContext(DatabaseContext);
  const { theme, systemTheme } = useTheme();
  const currentTheme = (theme === 'system' ? systemTheme : theme)

  const currentKey = keysContext.keys.find((key) => key.keyLocatorHash === audit.keyLocatorHash);
  return (
    <Link
      className={`flex items-center gap-3 p-3 rounded-md ${selected ? " text-primary-foreground bg-zinc-100 dark:bg-zinc-800" : "" } transition-colors over:bg-zinc-100 dark:hover:bg-zinc-800`}
      href=""
      onClick={onClick}
    >
      <div className="grid grid-cols-3 w-full block">
        <div className="font-medium">{audit.eventName}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">Key: {currentKey ? currentKey?.displayName : (audit.keyLocatorHash !== dbContext?.keyLocatorHash ? audit.keyLocatorHash?.slice(0, 8) + '...' : 'Your User Key')}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">Date: {audit.createdAt}</div>
        {selected ? (
        <div className="grid col-span-3 w-full block text-xs">
          <div className="w-full block max-h-[100px] overflow-y-scroll">
            <div>Record locator:</div>
            <JsonViewEditor style={currentTheme === 'dark' ? githubDarkTheme : githubLightTheme } className="w-full" value={JSON.parse(audit.recordLocator ?? '{}')} />
          </div>

          {audit.encryptedDiff ? (
            <div className="w-full block max-h-[100px] overflow-y-scroll">
              <div>Scope:</div>
              <JsonViewEditor style={currentTheme === 'dark' ? githubDarkTheme : githubLightTheme } className="w-full" value={JSON.parse(audit.encryptedDiff ?? '{}')} />
            </div>
          ) : null}
          <div className="w-full block p-2">
            {audit.ua} {audit.ip}
          </div>
        </div>
      ) : null}

      </div>
    </Link>
  );
}