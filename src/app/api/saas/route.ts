import { GetSaaSResponseSuccess } from "@/data/client/saas-api-client";
import { PlatformApiClient } from "@/data/server/platform-api-client";
import { getErrorMessage } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const saasToken = request.nextUrl.searchParams.get('saasToken');
        if(!saasToken) {
            return Response.json({ message: 'saasToken is required' }, { status: 400 });
        }

        const platformApiClient = new PlatformApiClient(saasToken);
        const saasResponse = await platformApiClient.account();
        if(saasResponse.status !== 200) {
            return Response.json({ message: 'Invalid saasToken', status: 400 });
        } else {
            const saasContext = await saasResponse.data
            console.log('saasContext', saasContext);
            let response:GetSaaSResponseSuccess = {
                data: {
                    currentQuota: saasContext.currentQuota,
                    currentUsage: saasContext.currentUsage,
                    email: saasContext.email,
                    userId: saasContext.userId,
                    saasToken: saasToken
                },
                status: 200,
                message: 'Success'
            }
            return Response.json(response, { status: 200 });
        }
    } catch (error) {
        console.error(error); 
        return Response.json({ message: 'Error accessing saas context ' + getErrorMessage(error), status: 400 });
    }
}