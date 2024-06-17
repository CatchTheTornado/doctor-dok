import { ConfigDTO, configDTOSchema } from "@/db/models";
import ServerConfigRepository from "@/db/server/server-config-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<ConfigDTO>(request, configDTOSchema, new ServerConfigRepository(), 'key');
}

export async function GET(request: Request) {
    return genericGET<ConfigDTO>(request, new ServerConfigRepository());
}
