import { Config } from "@/db/models";
import { setup } from '@/db/server/db-provider'
import ServerConfigRepository from "@/db/server/server-config-repository";

/**
 * Import patient data. Note: text data is end2end encrypted
 * @param request 
 */
export async function POST(request: Request) {
//    try { 
        await setup()
        const updatedConfig: Config = await request.json() as Config
        const repo = new ServerConfigRepository()
        const insertedData = await repo.update({ key: updatedConfig.key }, updatedConfig)

        return Response.json({ 
            message: 'Config updated',
            data: insertedData
        })
/*    } catch (e) {
        return Response.json({ 
            error: e.message,
        }, { status: 400 })        
    }*/
}

export async function GET(request: Request) {
    await setup()
    const repo = new ServerConfigRepository()
    const configs: Config[] = await repo.findAll()
    return Response.json(configs)
}
