import { useContext } from "react";
import PatientItem from "./patient-item";
import { PatientContext } from "@/contexts/patient-context";
import { DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";
import { ConfigContext } from "@/contexts/config-context";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

export default function PatientList() {
  const configContext = useContext(ConfigContext);
  const patientsContext = useContext(PatientContext)
  return (
        <div className="h-auto overflow-auto">
      { (configContext?.dataLinkStatus.isReady()) ? (
          <div className="p-4 space-y-4">
          {patientsContext?.loaderStatus === DataLoadingStatus.Loading ? (
              <div className="flex justify-center">
                <DataLoader />
              </div>
            ) : (
              patientsContext?.patients.map((patient, index) => (
                <PatientItem onClick={(e) => { e.preventDefault(); patientsContext.setCurrentPatient(patient); }} key={index} patient={patient} selected={patientsContext?.currentPatient?.id === patient.id} />
              )) 
            )}
          </div>
            ) : (
              <div className="h-auto overflow-auto">
                <div className="p-4 space-y-4">
                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Setup Database Encryption!</AlertTitle>
                    <AlertDescription>
                      Before using the app please setup the proper Encryption Key in application settings.
                    </AlertDescription>
                </Alert>
              </div>
            </div>
          )}              
        </div>      


  );
}