import { Config, configSchema } from "@/db/models";
import ServerConfigRepository from "@/db/server/server-config-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<Config>(request, configSchema, new ServerConfigRepository(), 'key');
}

export async function GET(request: Request) {
    return genericGET<Config>(request, new ServerConfigRepository());
}
