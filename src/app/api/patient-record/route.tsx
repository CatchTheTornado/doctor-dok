import { PatientRecordDTO, patientRecordDTOSchema } from "@/data/dto";
import ServerPatientRecordRepository from "@/data/server/server-patientrecord-repository";
import { genericGET, genericPUT, authorizeDatabaseIdHash } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: Request, response: NextResponse) {
    const apiResult = await genericPUT<PatientRecordDTO>(await request.json(), patientRecordDTOSchema, new ServerPatientRecordRepository(await authorizeDatabaseIdHash(request, response)), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: NextRequest, response: NextResponse) {
    return Response.json(await genericGET<PatientRecordDTO>(request, new ServerPatientRecordRepository(await authorizeDatabaseIdHash(request, response))));
}
