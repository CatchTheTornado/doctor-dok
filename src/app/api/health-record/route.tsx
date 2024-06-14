import { Patient } from "@/db/models";
import path from 'path'
import { setup } from '@/db/server/db-provider'
import ServerHealthRecordRepository from "@/db/server/server-healthrecord-repository";


//TODO: fix it!

/**
 * Import patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
    try { 
        await setup()
        const patientData: Patient = await request.json() as Patient
        const repo = new ServerHealthRecordRepository()
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
 * Mofigy patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function PUT(request: Request) {
    try { 
        await setup()
        const patientData: Patient = await request.json() as Patient
        const repo = new ServerHealthRecordRepository()
        if (!patientData.id) throw new Error('Please provide the "id" for the patient to be updated')
        const insertedData = await repo.update({ id: patientData.id }, patientData)

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
    const repo = new ServerPatientRepository()
    const patients: Patient[] = await repo.findAll()
    return Response.json(patients)
}
