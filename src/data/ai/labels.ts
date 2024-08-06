import { ConfigContextType } from "@/contexts/config-context";
import { PatientRecord, patientRecordItemSchema } from "../client/models";
import { zodToJsonSchema } from "zod-to-json-schema";

type LabelContext = {
    record?: PatientRecord;
    config?: ConfigContextType | null;
}
export const labels = {
    patientRecordItemLabel: (labelFor: string, context: LabelContext) => {
        switch(labelFor.trim().toLowerCase()) {
            case 'hospitalization': return 'Hospitalization';
            case 'hospital_discharge_summary': return 'Hospitalization';
            case 'blood_results': return 'Blood results';
            case 'mri': return 'MRI';
            case 'CT scan': return 'CT Scan';
            case 'CT': return 'CT Scan';
            case 'imaging': return 'Imaging';
            case 'radiology': return 'Radiology';
            case 'medical_record': return 'Medical record';
            default: return labelFor;
        }
    }
}