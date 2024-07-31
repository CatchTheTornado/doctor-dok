import { ConfigDTO, configDTOSchema } from "@/data/dto";
import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericDELETE, genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    const apiResult = await genericPUT<ConfigDTO>(await request.json(), configDTOSchema, new ServerConfigRepository(), 'key');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: Request) {
    return Response.json(await genericGET<ConfigDTO>(request, new ServerConfigRepository()));
}

// clear all configuration
export async function DELETE(request: Request) {
    const allConfigs = await genericGET<ConfigDTO>(request, new ServerConfigRepository());
    if(allConfigs.length <= 1){
        return Response.json({ message: "Cannot delete the last configuration", status: 400 }, {status: 400});
    } else {
        const deleteResults = [];
        for(const config of allConfigs){
            deleteResults.push(await genericDELETE(request, new ServerConfigRepository(), { key: config.key}));
        }
        return Response.json({ message: 'Configuration cleared!', data: deleteResults, status: 200 }, { status: 200 });
    }
}