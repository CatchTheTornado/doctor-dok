import { TermDTO, termsDTOSchema } from "@/data/dto";
import ServerTermRepository from "@/data/server/server-term-repository";
import { EncryptionUtils } from "@/lib/crypto";
import { authorizeRequestContext, genericGET, genericPUT } from "@/lib/generic-api";
import { NextRequest, NextResponse, userAgent } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {
    // TODO: Send the terms to SAAS management app
    const requestContext = await authorizeRequestContext(request, response);

    const inputObj = (await request.json())
    const valRes = termsDTOSchema.safeParse(inputObj);
    if(!valRes.success) {
        return Response.json({ message: 'Invalid input', issues: valRes.error.issues }, { status: 400 });
    }

    const termObj = valRes.data;
    termObj.ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || request.ip;
    const { device, ua } = userAgent(request)
    termObj.ua = ua;

    const encUtils = new EncryptionUtils(process.env.TERMS_ENCRYPTION_KEY ?? 'qAyn0sLFmqxvJYj7X2vJeJzS');
    termObj.email = await encUtils.encrypt(termObj.email ?? '');
    termObj.name = await encUtils.encrypt(termObj.name ?? '');

    const apiResult = await genericPUT<TermDTO>(termObj, termsDTOSchema, new ServerTermRepository(requestContext.databaseIdHash), 'key');
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const encUtils = new EncryptionUtils(process.env.TERMS_ENCRYPTION_KEY ?? 'qAyn0sLFmqxvJYj7X2vJeJzS');

    const apiResult = (await genericGET<TermDTO>(request, new ServerTermRepository(requestContext.databaseIdHash)));
    for (const term of apiResult) {
        term.email = await encUtils.decrypt(term.email ?? ''),
        term.name = await encUtils.decrypt(term.name ?? '')
    };
    return Response.json(apiResult);
}
