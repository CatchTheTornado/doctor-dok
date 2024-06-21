import { PatientDTO, patientDTOSchema } from "@/data/dto";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";


export async function PUT(request: Request) {
    const apiResult = await genericPUT<PatientDTO>(await request.json(), patientDTOSchema, new ServerPatientRepository(), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: Request) {
    return Response.json(await genericGET<PatientDTO>(request, new ServerPatientRepository()));
}
