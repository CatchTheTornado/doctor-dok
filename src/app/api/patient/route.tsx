import { PatientDTO, patientDTOSchema } from "@/data/dto";
import ServerPatientRepository from "@/data/server/server-patient-repository";
import { genericGET, genericPUT, genericDELETE } from "@/lib/generic-api";


export async function PUT(request: Request) {
    const apiResult = await genericPUT<PatientDTO>(await request.json(), patientDTOSchema, new ServerPatientRepository(), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

// return all patients
export async function GET(request: Request) {
    return Response.json(await genericGET<PatientDTO>(request, new ServerPatientRepository()));
}

// clear all patients
export async function DELETE(request: Request) {
    const allPatients = await genericGET<PatientDTO>(request, new ServerPatientRepository());
    if(allPatients.length <= 1){
        return Response.json({ message: "Cannot delete patients", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const patient of allPatients){
            deleteResults.push(await genericDELETE(request, new ServerPatientRepository(), { id: patient.id}));
        }
        return Response.json({ message: 'Patients cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}