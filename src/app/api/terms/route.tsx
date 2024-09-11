import { TermDTO, termsDTOSchema } from "@/data/dto";
import ServerTermRepository from "@/data/server/server-term-repository";
import { authorizeRequestContext, genericGET, genericPUT } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {

    // TODO: Send the terms to SAAS management app
    const requestContext = await authorizeRequestContext(request, response);
    const apiResult = await genericPUT<TermDTO>(await request.json(), termsDTOSchema, new ServerTermRepository(requestContext.databaseIdHash), 'key');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    return Response.json(await genericGET<TermDTO>(request, new ServerTermRepository(requestContext.databaseIdHash)));
}
