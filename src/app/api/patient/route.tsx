import { Patient } from "@/db/models";
import ServerPatientRepository from "@/db/server/server-patient-repository";
import { NextResponse } from "next/server";
import path from 'path'
import { setup } from '@/db/server/db-provider'

/**
 * Import patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
    try { 
        await setup()
        const patientData: Patient = await request.json() as Patient
        const repo = new ServerPatientRepository()
        const insertedData = await repo.create(patientData)

        return Response.json({ 
            message: 'Data inserted',
            data: insertedData
        })
    } catch (e) {
        return Response.json({ 
            error: e,
        }, { status: 400 })        
    }
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerPatientRepository()
    const patients: Patient[] = await repo.findAll()
    return Response.json(patients)
}
