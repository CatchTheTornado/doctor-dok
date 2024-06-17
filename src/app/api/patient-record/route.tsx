import { Patient, PatientRecord, patientRecordSchema } from "@/db/models";
import { setup } from '@/db/server/db-provider'
import ServerPatientRecordRepository from "@/db/server/server-patientrecord-repository";
import { getErrorMessage } from "@/lib/utils";

/**
 * Modify patient record data. Note: text data is end2end encrypted
 * @param request 
 */
export async function PUT(request: Request) {
    try { 
        await setup()
        const patientRecordData: PatientRecord = patientRecordSchema.cast(await request.json())
        const repo = new ServerPatientRecordRepository()

        let updatedData = patientRecordData.id ? await repo.update({ id: patientRecordData.id }, patientRecordData) : repo.create(patientRecordData);

        return Response.json({ 
            message: 'Data updated',
            data: updatedData
        })
    } catch (e) {
        console.error(e)
        return Response.json({ 
            error: e,
            message: getErrorMessage(e)
        }, { status: 400 })        
    }
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerPatientRecordRepository()
    const patientRecords: PatientRecord[] = await repo.findAll()
    return Response.json(patientRecords)
}
