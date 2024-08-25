import { BaseRepository, IFilter, IQuery } from "./base-repository"
import { and, eq } from "drizzle-orm/sql";
import { StatDTO } from "../dto";
import { stats } from "./db-schema-stats";


export default class ServerStatRepository extends BaseRepository<StatDTO> {

    async aggregate(newItem: StatDTO): Promise<StatDTO> {
        const db = (await this.db());

        const date = new Date(newItem.createdAt);

        let existingAggregate:StatDTO = db.select().from(stats).where(and(eq(stats.createdHour, date.getHours()), eq(stats.createdDay, date.getDay()), eq(stats.createdMonth, date.getMonth()), eq(stats.eventName, newItem.eventName as string), eq(stats.createdYear, date.getFullYear()))).get() as StatDTO
        if (!existingAggregate) {
            existingAggregate = db.insert(stats).values({
                completionTokens: newItem.completionTokens,
                promptTokens: newItem.promptTokens,
                createdAt: newItem.createdAt,
                createdDay: date.getDay(),
                createdHour: date.getHours(),
                createdMonth: date.getMonth(),
                createdYear: date.getFullYear(),
                counter: 1,
                finishReasons: '',
                eventName: newItem.eventName as string
            }).returning().get() as StatDTO;
        } else {
            existingAggregate.counter = existingAggregate.counter + 1;
            existingAggregate.completionTokens += newItem.completionTokens;
            existingAggregate.promptTokens += newItem.promptTokens;
          
            db.update(stats).set(existingAggregate).where(eq(stats.id, newItem.id)).run();
        }
        return Promise.resolve(existingAggregate as StatDTO)   


    }


}