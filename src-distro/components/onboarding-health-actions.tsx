'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Upload } from "lucide-react"
import { useContext } from "react";
import { RecordContext } from "@/contexts/record-context";
import { ApiClient } from "@/data/client/base-api-client";
import { DatabaseContext } from "@/contexts/db-context";
import { toast } from "sonner";
import { FolderContext } from "@/contexts/folder-context";
import { Folder } from "@/data/client/models";

export function OnboardingHealthActions() {
  const recordContext = useContext(RecordContext);
  const dbContext = useContext(DatabaseContext);
  const folderContext = useContext(FolderContext);
  
  const handleImportExamples = async () => {
    try {
      const apiClient = new ApiClient('', dbContext)
      toast.info('Downloading examples ...');

      const examplesArrayBuffer = await apiClient.getArrayBuffer('/onboarding/DoctorDok-onboarding.zip');
      await recordContext?.importRecords(examplesArrayBuffer as ArrayBuffer);
      recordContext?.listRecords(folderContext?.currentFolder as Folder);
    } catch (error) {
      toast.error('Error while downloading examples');
    }
  }

  const handleImportOwnResults = () => {
    // Implement your import own results action here
    recordContext?.setRecordDialogOpen(true);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleImportExamples}>
        <CardHeader className="flex flex-col items-center text-center">
          <FileDown className="w-12 h-12 mb-4 text-primary" />
          <CardTitle>Import examples</CardTitle>
          <CardDescription className="mt-2">
            Import example and anonymized health records on which you might test all the Doctor Dok features like chatting with health history or getting longevity/health improvement ideas.
          </CardDescription>
          <Button className="mt-4">
            Import Examples
          </Button>
        </CardHeader>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleImportOwnResults}>
        <CardHeader className="flex flex-col items-center text-center">
          <Upload className="w-12 h-12 mb-4 text-primary" />
          <CardTitle>Import your own health results</CardTitle>
          <CardDescription className="mt-2">
            Upload PDF file with your latest blood results, MRI, RTG or doctor's note to check how Doctor Dok can help you manage and improve health data.
          </CardDescription>
          <Button className="mt-4">
            Upload Files
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}