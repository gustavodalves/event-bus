import { MongoClient, Collection, MongoServerError } from 'mongodb';
import { Idempotency } from '../Model';
import { IdempotencyRepository, IdempotencyRepositoryInput } from '../ports/Repository';

type IdempotencyDocument = Idempotency & {
  updatedAt: Date;
  expireAt: Date;
};

export class IdempotencyRepositoryMongoAdapter implements IdempotencyRepository {
    private indepotencyCollection: Collection<IdempotencyDocument>;

    constructor(client: MongoClient, dbName: string) {
        const db = client.db(dbName);
        this.indepotencyCollection = db.collection<IdempotencyDocument>('idempotency');
    }

    private getExpireAtDate(): Date {
        return new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
    }

    async createIfNotExists(event: Idempotency): Promise<void> {
        const expireAt = this.getExpireAtDate();
        try {
            await this.indepotencyCollection.insertOne({
                ...event,
                status: 'consuming',
                updatedAt: new Date(),
                expireAt
            });
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new Error('Idempotency record already exists');
            }
            throw error;
        }
    }

    async update({ id, consumer, status }: Idempotency): Promise<void> {
        const expireAt = this.getExpireAtDate();
        await this.indepotencyCollection.updateOne(
            { id, consumer },
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                    expireAt
                }
            }
        );
    }

    async isConsuming({ id, source }: IdempotencyRepositoryInput): Promise<boolean> {
        const existing = await this.indepotencyCollection.findOne({
            id,
            consumer: source,
            status: { $in: ['consuming', 'consumed'] }
        });
        return !!existing;
    }
}
