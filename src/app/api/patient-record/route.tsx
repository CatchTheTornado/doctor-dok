import { PatientRecordDTO, patientRecordDTOSchema } from "@/data/dto";
import ServerPatientRecordRepository from "@/data/server/server-patientrecord-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    const apiResult = await genericPUT<PatientRecordDTO>(await request.json(), patientRecordDTOSchema, new ServerPatientRecordRepository(), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: Request) {
    return Response.json(await genericGET<PatientRecordDTO>(request, new ServerPatientRecordRepository()));
}
