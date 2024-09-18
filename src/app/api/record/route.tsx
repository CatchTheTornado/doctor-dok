import { RecordDTO, recordDTOSchema } from "@/data/dto";
import ServerRecordRepository from "@/data/server/server-record-repository";
import { authorizeRequestContext, authorizeSaasContext, genericGET, genericPUT } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const inputObj = (await request.json())
    const apiResult = await genericPUT<RecordDTO>(inputObj, recordDTOSchema, new ServerRecordRepository(requestContext.databaseIdHash), 'id');
    return Response.json(apiResult, { status: apiResult.status });

}

export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    return Response.json(await genericGET<RecordDTO>(request, new ServerRecordRepository(requestContext.databaseIdHash)));
}
