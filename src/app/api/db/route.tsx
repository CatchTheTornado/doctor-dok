import { PatientDTO, patientDTOSchema } from "@/data/dto";
import { formatDb } from "@/data/server/db-provider";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT, genericDELETE } from "@/lib/generic-api";
import { getErrorMessage } from "@/lib/utils";



// clear all the database
export async function DELETE(request: Request) {
    try {
        await formatDb();
        return Response.json({ message: 'Database erased and formatted.', status: 200 }, { status: 200 });
    } catch (e) {
        console.log(e);
        return Response.json({ message: getErrorMessage(e), status: 400 }, {status: 400});
    }
}
