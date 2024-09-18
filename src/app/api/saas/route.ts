import { GetSaaSResponseSuccess } from "@/data/client/saas-api-client";
import { SaaSDTO } from "@/data/dto";
import { PlatformApiClient } from "@/data/server/platform-api-client";
import { authorizeSaasContext } from "@/lib/generic-api";
import { getErrorMessage } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
    try {

        const authorizedContext = await authorizeSaasContext(request); // authorize SaaS context
        if (!authorizedContext.hasAccess) {
            return Response.json({
                message: authorizedContext.error,
                status: 403
            });
        }

        const saasContext = authorizedContext.saasContex as SaaSDTO;
        let response:GetSaaSResponseSuccess = {
            data: {
                currentQuota: saasContext.currentQuota,
                currentUsage: saasContext.currentUsage,
                email: saasContext.email,
                userId: saasContext.userId,
                saasToken: saasContext.saasToken
            },
            status: 200,
            message: 'Success'
        }
        return Response.json(response, { status: 200 });   
    } catch (error) {
        console.error(error); 
        return Response.json({ message: 'Error accessing saas context ' + getErrorMessage(error), status: 400 });
    }
}