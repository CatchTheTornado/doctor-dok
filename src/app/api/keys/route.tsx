import { KeyDTO, keyDTOSchema } from "@/data/dto";
import ServerConfigRepository from "@/data/server/server-config-repository";
import ServerKeyRepository from "@/data/server/server-key-repository";
import { authorizeRequestContext, genericGET, genericPUT } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    if (requestContext.acl.role !== 'owner') {
        return Response.json({ message: "Owner role is required", status: 401 }, {status: 401});
    }

    const apiResult = await genericPUT<KeyDTO>(await request.json(), keyDTOSchema, new ServerKeyRepository(requestContext.databaseIdHash), 'keyLocatorHash');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    return Response.json(await genericGET<KeyDTO>(request, new ServerKeyRepository(requestContext.databaseIdHash)));
}
