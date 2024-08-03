import { ConfigDTO, configDTOSchema } from "@/data/dto";
import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericDELETE, genericGET, genericPUT, authorizeDatabaseIdHash } from "@/lib/generic-api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {
    const apiResult = await genericPUT<ConfigDTO>(await request.json(), configDTOSchema, new ServerConfigRepository(await authorizeDatabaseIdHash(request, response)), 'key');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: NextRequest, response: NextResponse) {
    return Response.json(await genericGET<ConfigDTO>(request, new ServerConfigRepository(await authorizeDatabaseIdHash(request, response))));
}

// clear all configuration
export async function DELETE(request: NextRequest, response: NextResponse) {
    const allConfigs = await genericGET<ConfigDTO>(request, new ServerConfigRepository(await authorizeDatabaseIdHash(request, response)));
    if(allConfigs.length <= 1){
        return Response.json({ message: "Cannot delete the last configuration", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const config of allConfigs){
            deleteResults.push(await genericDELETE(request, new ServerConfigRepository(await authorizeDatabaseIdHash(request, response)), { key: config.key}));
        }
        return Response.json({ message: 'Configuration cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}