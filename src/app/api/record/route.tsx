import { RecordDTO, recordDTOSchema } from "@/data/dto";
import ServerRecordRepository from "@/data/server/server-record-repository";
import { authorizeRequestContext, genericGET, genericPUT } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: Request, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const apiResult = await genericPUT<RecordDTO>(await request.json(), recordDTOSchema, new ServerRecordRepository(requestContext.databaseIdHash), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    return Response.json(await genericGET<RecordDTO>(request, new ServerRecordRepository(requestContext.databaseIdHash)));
}
