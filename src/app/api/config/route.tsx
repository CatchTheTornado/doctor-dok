import { ConfigDTO, configDTOSchema } from "@/data/dto";
import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    const apiResult = await genericPUT<ConfigDTO>(await request.json(), configDTOSchema, new ServerConfigRepository(), 'key');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: Request) {
    return Response.json(await genericGET<ConfigDTO>(request, new ServerConfigRepository()));
}
