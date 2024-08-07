import ServerConfigRepository from "@/data/server/server-config-repository";
import { authorizeRequestContext, genericDELETE } from "@/lib/generic-api";

export async function DELETE(request: Request, { params }: { params: { hash: string }} ) {
    const requestContext = await authorizeRequestContext(request);

    const recordLocator = params.hash;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no key provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerConfigRepository(requestContext.databaseIdHash), { key: recordLocator}));
    }
}