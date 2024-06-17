import { ConfigDTO, configDTOSchema } from "@/data/models";
import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<ConfigDTO>(request, configDTOSchema, new ServerConfigRepository(), 'key');
}

export async function GET(request: Request) {
    return genericGET<ConfigDTO>(request, new ServerConfigRepository());
}
