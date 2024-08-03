import { PatientRecordDTO, patientRecordDTOSchema } from "@/data/dto";
import ServerPatientRecordRepository from "@/data/server/server-patientrecord-repository";
import { genericGET, genericPUT, getDatabaseIdHash } from "@/lib/generic-api";
import { NextRequest } from "next/server";

export async function PUT(request: Request) {
    const apiResult = await genericPUT<PatientRecordDTO>(await request.json(), patientRecordDTOSchema, new ServerPatientRecordRepository(getDatabaseIdHash(request)), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: NextRequest) {
    return Response.json(await genericGET<PatientRecordDTO>(request, new ServerPatientRecordRepository(getDatabaseIdHash(request))));
}
