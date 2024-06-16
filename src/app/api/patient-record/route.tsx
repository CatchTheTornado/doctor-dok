import { Patient, PatientRecord } from "@/db/models";
import { setup } from '@/db/server/db-provider'
import ServerPatientRecordRepository from "@/db/server/server-patientrecord-repository";

/**
 * TODO - the POST actions are almost the same for any record type - let's figure out if we can DRY it a little biy
 * TODO - add validation
 * Import patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
    try { 
        await setup()
        const patientData: PatientRecord = await request.json() as PatientRecord
        const repo = new ServerPatientRecordRepository()
        const insertedData = await repo.create(patientData)

        return Response.json({ 
            message: 'Data inserted',
            data: insertedData
        })
    } catch (e) {
        console.error(e)
        return Response.json({ 
            error: e.message,
        }, { status: 400 })        
    }
}

/**
 * Modify patient record data. Note: text data is end2end encrypted
 * @param request 
 */
export async function PUT(request: Request) {
    try { 
        await setup()
        const patientRecordData: PatientRecord = await request.json() as PatientRecord
        const repo = new ServerPatientRecordRepository()
        if (!patientRecordData.id) throw new Error('Please provide the "id" for the patient record to be updated')
        const insertedData = await repo.update({ id: patientRecordData.id }, patientRecordData)

        return Response.json({ 
            message: 'Data updated',
            data: insertedData
        })
    } catch (e) {
        console.error(e)
        return Response.json({ 
            error: e.message,
        }, { status: 400 })        
    }
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerPatientRecordRepository()
    const patientRecords: PatientRecord[] = await repo.findAll()
    return Response.json(patientRecords)
}
