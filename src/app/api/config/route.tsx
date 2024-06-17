import { Config, configSchema } from "@/db/models";
import { setup } from '@/db/server/db-provider'
import ServerConfigRepository from "@/db/server/server-config-repository";
import { getErrorMessage } from "@/lib/utils";

/**
 * Import patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function PUT(request: Request) {
    try { 
        await setup()
        const updatedConfig: Config = configSchema.cast(await request.json()); // cast + validation
        const repo = new ServerConfigRepository()
        const updatedData = updatedConfig.key ? await repo.update({ key: updatedConfig.key }, updatedConfig): await repo.create(updatedConfig)

        return Response.json({ 
            message: 'Config updated',
            data: updatedData
        })
    } catch (e) {
        console.error(e)
        return Response.json({ 
            message: getErrorMessage(e),
            error: e
        }, { status: 400 })        
    }
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerConfigRepository()
    const configs: Config[] = await repo.findAll()
    return Response.json(configs)
}
