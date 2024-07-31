import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericDELETE, getDatabaseId } from "@/lib/generic-api";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { key: string }} ) {
    const recordLocator = params.key;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no key provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerConfigRepository(getDatabaseId(request)), { key: recordLocator}));
    }
}