import { BaseRepository, IFilter, IQuery } from "./base-repository"
import { and, eq } from "drizzle-orm/sql";
import { AggregatedStatsDTO, StatDTO } from "../dto";
import { stats } from "./db-schema-stats";
import currentPricing from '@/data/ai/pricing.json'

export function roundToTwoDigits(num: number): number {
    return Math.round(num * 100) / 100;
}

export default class ServerStatRepository extends BaseRepository<StatDTO> {

    async thisAndLastMonth(): Promise<AggregatedStatsDTO> {
        const db = (await this.db());
        const thisMonth = db.select().from(stats).where(and(eq(stats.createdMonth, new Date().getMonth()), eq(stats.createdYear, new Date().getFullYear()))).all() as StatDTO[];
        const today = db.select().from(stats).where(and(eq(stats.createdMonth, new Date().getMonth()), eq(stats.createdYear, new Date().getFullYear()), eq(stats.createdDay, new Date().getDate()))).all() as StatDTO[];

        let lastMonthNo = new Date().getMonth() - 1;
        let lastMonthYearNo = new Date().getFullYear();
        if (lastMonthNo < 1) { lastMonthNo = 12; lastMonthYearNo = lastMonthYearNo - 1; }
        const lastMonth = db.select().from(stats).where(and(eq(stats.createdMonth, lastMonthNo), eq(stats.createdYear, lastMonthYearNo))).all() as StatDTO[];

        const thisMonthAggregated = thisMonth.reduce((acc, item) => {
            acc.overallTokens += item.completionTokens + item.promptTokens;
            acc.promptTokens += item.promptTokens;
            acc.completionTokens += item.completionTokens;
            acc.requests += item.counter ? item.counter : 0;
            return acc;
        }, { overallTokens: 0, promptTokens: 0, completionTokens: 0, overalUSD: 0, requests: 0 } as AggregatedStatsDTO['thisMonth']);

        thisMonthAggregated.overalUSD = roundToTwoDigits(currentPricing["gpt-4o"].input  / 1000 * thisMonthAggregated.promptTokens + currentPricing["gpt-4o"].output / 1000 * thisMonthAggregated.completionTokens);

        const lastMonthAggregated = lastMonth.reduce((acc, item) => {
            acc.overallTokens += item.completionTokens + item.promptTokens;
            acc.promptTokens += item.promptTokens;
            acc.completionTokens += item.completionTokens;
            acc.requests += item.counter ? item.counter : 0;
            return acc;
        }, { overallTokens: 0, promptTokens: 0, completionTokens: 0, overalUSD: 0, requests: 0 } as AggregatedStatsDTO['lastMonth']);

        lastMonthAggregated.overalUSD = roundToTwoDigits(currentPricing["gpt-4o"].input / 1000 * lastMonthAggregated.promptTokens + currentPricing["gpt-4o"].output / 1000 * lastMonthAggregated.completionTokens);


        const todayAggregated = today.reduce((acc, item) => {
            acc.overallTokens += item.completionTokens + item.promptTokens;
            acc.promptTokens += item.promptTokens;
            acc.completionTokens += item.completionTokens;
            acc.requests += item.counter ? item.counter : 0;
            return acc;
        }, { overallTokens: 0, promptTokens: 0, completionTokens: 0, overalUSD: 0, requests: 0 } as AggregatedStatsDTO['today']);

        todayAggregated.overalUSD = roundToTwoDigits(currentPricing["gpt-4o"].input / 1000 * todayAggregated.promptTokens + currentPricing["gpt-4o"].output / 1000 * todayAggregated.completionTokens);

        return Promise.resolve({ thisMonth: thisMonthAggregated, lastMonth: lastMonthAggregated, today: todayAggregated } as AggregatedStatsDTO)

    }

    async aggregate(newItem: StatDTO): Promise<StatDTO> {
        const db = (await this.db());

        const date = new Date(newItem.createdAt);

        let existingAggregate:StatDTO = db.select().from(stats).where(and(eq(stats.createdHour, date.getHours()), eq(stats.createdDay, date.getDate()), eq(stats.createdMonth, date.getMonth()), eq(stats.eventName, newItem.eventName as string), eq(stats.createdYear, date.getFullYear()))).get() as StatDTO
        if (!existingAggregate) {
            existingAggregate = db.insert(stats).values({
                completionTokens: newItem.completionTokens,
                promptTokens: newItem.promptTokens,
                createdAt: newItem.createdAt,
                createdDay: date.getDate(),
                createdHour: date.getHours(),
                createdMonth: date.getMonth(),
                createdYear: date.getFullYear(),
                counter: 1,
                finishReasons: '',
                eventName: newItem.eventName as string
            }).returning().get() as StatDTO;
        } else {
            existingAggregate.counter = (existingAggregate.counter ? existingAggregate.counter : 0) + 1;
            existingAggregate.completionTokens += newItem.completionTokens;
            existingAggregate.promptTokens += newItem.promptTokens;
          
            if (existingAggregate.id) {
                db.update(stats).set(existingAggregate).where(eq(stats.id, existingAggregate.id)).run();
            } else throw new Error('No id in the item to update');
        }
        return Promise.resolve(existingAggregate as StatDTO)   


    }


}