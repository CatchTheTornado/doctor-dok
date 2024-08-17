import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericDELETE, authorizeRequestContext } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { key: string }}) {
    const recordLocator = params.key;
    const requestContext = await authorizeRequestContext(request);
    if (requestContext.acl.role !== 'owner') {
        return Response.json({ message: "Owner role is required", status: 401 }, {status: 401});
    }

    if(!recordLocator){
        return Response.json({ message: "Invalid request, no key provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerConfigRepository(requestContext.databaseIdHash), { key: recordLocator}));
    }
}