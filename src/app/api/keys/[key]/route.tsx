import ServerConfigRepository from "@/data/server/server-config-repository";
import { genericDELETE } from "@/lib/generic-api";

export async function DELETE(request: Request, { params }: { params: { hash: string }} ) {
    const recordLocator = params.hash;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no key provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerConfigRepository(), { key: recordLocator}));
    }
}