import { GetSaaSResponseSuccess } from "@/data/client/saas-api-client";
import { getErrorMessage } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const saasToken = request.nextUrl.searchParams.get('saasToken');
        if(!saasToken) {
            return Response.json({ message: 'saasToken is required' }, { status: 400 });
        }

        const saasPlatformUrl = process.env.SAAS_PLATFORM_URL || 'http://localhost:3001'
        const saasResponse = await fetch(saasPlatformUrl + '/api/users/me?apiKey=' + encodeURIComponent(saasToken));
        if(saasResponse.status !== 200) {
            return Response.json({ message: 'Invalid saasToken', status: 400 });
        } else {
            const saasContext = await saasResponse.json();
            console.log('saasContext', saasContext);
            let response:GetSaaSResponseSuccess = {
                data: {
                    currentQuota: saasContext.data.currentQuota,
                    currentUsage: saasContext.data.currentUsage,
                    email: saasContext.data.email,
                    userId: saasContext.data.id,
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