import { PatientDTO, patientDTOSchema } from "@/data/dto";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT, genericDELETE, authorizeDatabaseIdHash } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest, response: NextResponse) {
    const apiResult = await genericPUT<PatientDTO>(await request.json(), patientDTOSchema, new ServerPatientRepository(await authorizeDatabaseIdHash(request, response)), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

// return all patients
export async function GET(request: NextRequest, response: NextResponse) {
    return Response.json(await genericGET<PatientDTO>(request, new ServerPatientRepository(await authorizeDatabaseIdHash(request, response))));
}

// clear all patients
export async function DELETE(request: NextRequest, response: NextResponse) {
    const allPatients = await genericGET<PatientDTO>(request, new ServerPatientRepository(await authorizeDatabaseIdHash(request, response)));
    if(allPatients.length <= 1){
        return Response.json({ message: "Cannot delete patients", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const patient of allPatients){
            deleteResults.push(await genericDELETE(request, new ServerPatientRepository(await authorizeDatabaseIdHash(request, response)), { id: patient.id}));
        }
        return Response.json({ message: 'Patients cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}