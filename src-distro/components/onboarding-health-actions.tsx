'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Upload } from "lucide-react"
import { useContext } from "react";
import { RecordContext } from "@/contexts/record-context";

export function OnboardingHealthActions() {
  const recordContext = useContext(RecordContext);
  
  const handleImportExamples = () => {
    // Implement your import examples action here
    console.log("Import examples clicked")
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
          <Button className="mt-4" onClick={handleImportExamples}>
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
          <Button className="mt-4" onClick={handleImportOwnResults}>
            Upload Files
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}