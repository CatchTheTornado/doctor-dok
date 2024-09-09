import { useContext, useEffect, useState } from "react";
import FolderItem from "./folder-item";
import { FolderContext } from "@/contexts/folder-context";
import { DatabaseAuthStatus, DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";
import { ConfigContext } from "@/contexts/config-context";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ListIcon, PlusIcon, Share2Icon, Terminal } from "lucide-react";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { Button } from "./ui/button";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { FolderEditPopup } from "./folder-edit-popup";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { DatabaseContext } from "@/contexts/db-context";
import { KeyContext, KeyContextProvider } from "@/contexts/key-context";
import SharedKeyItem from "./shared-key-item";
import { SharedKeyEditPopup } from "./shared-key-edit-popup";
import { AuditContext } from "@/contexts/audit-context";
import { auditLog } from "@/lib/audit";
import AuditLogItem from "./audit-log-item";

export default function AuditLogPopup() {
  const configContext = useContext(ConfigContext);
  const dbContext = useContext(DatabaseContext);
  const keyContext = useContext(KeyContext);
  const auditContext = useContext(AuditContext);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    auditContext?.loadLogs(limit, offset);
    keyContext.loadKeys();
  }, [limit, offset, auditContext?.lastAudit]);

  return (
    <Credenza open={auditContext.auditLogOpen} onOpenChange={auditContext.setAuditLogDialogOpen}>
      <CredenzaContent className="sm:max-w-[700px] bg-white dark:bg-zinc-950" side="top">
        <CredenzaHeader>
          <CredenzaTitle>Audit log
          </CredenzaTitle>
          <CredenzaDescription>
            Check which Keys had access and what was changed in your data
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="h-auto overflow-auto">
            
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <div className="p-4 space-y-4">
                {auditContext?.loaderStatus === DataLoadingStatus.Loading ? (
                  <div className="flex justify-center">
                    <DataLoader />
                  </div>
                ) : (
                  (auditContext?.logs.length > 0) ?
                    auditContext?.logs.map((audit, index) => (
                      <AuditLogItem onClick={(e) => { auditContext.setCurrentAudit(audit); }} key={index} audit={audit} selected={auditContext?.currentAudit?.id === audit.id} />
                    ))
                    : (
                      <NoRecordsAlert title="Data is not shared">
                        No logs found in database.
                      </NoRecordsAlert>
                    )
                )}
              </div>
            ) : (
              <DatabaseLinkAlert />
            )}
          </div>
          <div className="flex gap-2 items-right">
            {(auditContext.logs.length >= limit) ? (<Button variant="ghost" className="m-2" onClick={(e) => { setOffset(offset + limit); }}>&lt; Prev</Button>) : null}            
            {(offset > 0) ? (<Button className="m-2" variant="ghost" onClick={(e) => { setOffset(offset - limit); }}>Next &gt;</Button>) : null}
            </div>

        </div>
      </CredenzaContent>
    </Credenza>
  );
}