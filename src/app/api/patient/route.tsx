import { PatientDTO, patientDTOSchema } from "@/data/dto";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT, genericDELETE, getDatabaseId } from "@/lib/generic-api";
import { NextRequest } from "next/server";


export async function PUT(request: NextRequest) {
    const apiResult = await genericPUT<PatientDTO>(await request.json(), patientDTOSchema, new ServerPatientRepository(getDatabaseId(request)), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

// return all patients
export async function GET(request: NextRequest) {
    return Response.json(await genericGET<PatientDTO>(request, new ServerPatientRepository(getDatabaseId(request))));
}

// clear all patients
export async function DELETE(request: NextRequest) {
    const allPatients = await genericGET<PatientDTO>(request, new ServerPatientRepository(getDatabaseId(request)));
    if(allPatients.length <= 1){
        return Response.json({ message: "Cannot delete patients", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const patient of allPatients){
            deleteResults.push(await genericDELETE(request, new ServerPatientRepository(getDatabaseId(request)), { id: patient.id}));
        }
        return Response.json({ message: 'Patients cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}