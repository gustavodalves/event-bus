import { MongoClient, Collection } from 'mongodb';
import { OutboxRepository } from '../ports/Repository';
import { Outbox } from '../Model';

export class OutboxRepositoryMongoAdapter implements OutboxRepository {
    private outboxCollection: Collection<Outbox>;

    constructor(client: MongoClient, dbName: string) {
        const db = client.db(dbName);
        this.outboxCollection = db.collection<Outbox>('outbox');
    }

    async publish(event: Outbox): Promise<void> {
        await this.outboxCollection.updateOne(
            { id: event.id },
            { $set: event },
            { upsert: true }
        );
    }

    async update({ id, status }: Outbox): Promise<void> {
        await this.outboxCollection.updateOne(
            { id },
            { $set: { status } }
        );
    }
}
