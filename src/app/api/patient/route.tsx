import { Patient } from "@/db/models";
import ServerPatientRepository from "@/db/server/server-patient-repository";
import { NextResponse } from "next/server";
import path from 'path'

/**
 * Get the patients list. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
    const dbFilePath = process.env.DB_FILE ?? path.resolve(process.cwd()) + '/data/db.sqlite'
    const patientData: Patient = await request.json() as Patient
    console.log('Patient to insert ', patientData)

    const repo = new ServerPatientRepository(dbFilePath)
    const insertedData = repo.create(patientData)

    return NextResponse.json(insertedData)
}
