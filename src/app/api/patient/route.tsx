import { PatientDTO, patientDTOSchema } from "@/data/dto";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT, genericDELETE, authorizeRequestContext } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const apiResult = await genericPUT<PatientDTO>(await request.json(), patientDTOSchema, new ServerPatientRepository(requestContext.databaseIdHash), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

// return all patients
export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    return Response.json(await genericGET<PatientDTO>(request, new ServerPatientRepository(requestContext.databaseIdHash)));
}

// clear all patients
export async function DELETE(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const allPatients = await genericGET<PatientDTO>(request, new ServerPatientRepository(requestContext.databaseIdHash));
    if(allPatients.length <= 1){
        return Response.json({ message: "Cannot delete patients", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const patient of allPatients){
            deleteResults.push(await genericDELETE(request, new ServerPatientRepository(requestContext.databaseIdHash), { id: patient.id as number}));
        }
        return Response.json({ message: 'Patients cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}