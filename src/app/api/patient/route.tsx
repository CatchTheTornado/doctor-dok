import { Patient, patientSchema } from "@/db/models";
import ServerPatientRepository from "@/db/server/server-patient-repository";
import { NextResponse } from "next/server";
import path from 'path'
import { setup } from '@/db/server/db-provider'
import { getErrorMessage } from "@/lib/utils";

/**
 * Mofigy patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function PUT(request: Request) {
    try { 
        await setup()
        const patientData: Patient = patientSchema.cast(await request.json())
        const repo = new ServerPatientRepository()
        
        const updatedData = patientData.id ? await repo.update({ id: patientData.id }, patientData) : await repo.create(patientData)

        return Response.json({ 
            message: 'Data updated',
            data: updatedData
        })
    } catch (e) {
        console.error(e)
        return Response.json({ 
            message: getErrorMessage(e),
            error: e
        }, { status: 400 })        
    }
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerPatientRepository()
    const patients: Patient[] = await repo.findAll()
    return Response.json(patients)
}
