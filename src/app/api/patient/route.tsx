import { Patient } from "@/db/models";
import ServerPatientRepository from "@/db/server/server-patient-repository";
import { NextResponse } from "next/server";

/**
 * Get the patients list. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
    const patientData: Patient = await request.json() as Patient
    console.log('Patient to insert ', patientData)

    const repo = new ServerPatientRepository()
    const insertedData = repo.create(patientData)

    return NextResponse.json(insertedData)
}
