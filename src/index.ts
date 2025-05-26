import { MongoClient } from 'mongodb';
import { OutboxRepositoryMongoAdapter } from './Outbox/adapters/OutboxRepositoryMongoAdapter';
import { IdempotencyRepositoryMongoAdapter } from './Idempotency/adapters/IdempotencyRepositoryMongoAdapter';
import { EventBusMessageBrokerAdapter } from './EventBus/adapters/EventBusMessageBrokerAdapter';
import { OutboxEventBusDecorator } from './EventBus/adapters/decorators/OutboxEventBusDecorator';
import { IdempotencyEventBusDecorator } from './EventBus/adapters/decorators/IdempotencyEventBusDecorator';
import type { EventBus } from './EventBus/ports/EventBus';
import { RabbitMQAdapter } from './MessageBroker/adapters/RabbitMQMessageBrokerAdapter.ts';

export { EventBus } from './EventBus/ports/EventBus';
export { IDomainEvent, BaseDomainEvent } from './DomainEvent';

interface CreateEventBusOptions {
  mongo: {
    mongoUri: string;
    mongoDbName: string;
  },
  rabbitmq: {
    hostname: string;
    port: number;
    username: string;
    password: string;
    protocol: 'amqp' | 'amqps';
    prefetch?: number
  };
}

export async function createEventBus(options: CreateEventBusOptions): Promise<EventBus> {
    const { mongo: { mongoDbName, mongoUri }, rabbitmq } = options;

    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    const db = mongoClient.db(mongoDbName);
    await db.createCollection('outbox').catch(() => {});
    await db.createCollection('idempotency').catch(() => {});

    const outboxRepository = new OutboxRepositoryMongoAdapter(mongoClient, mongoDbName);
    const idempotencyRepository = new IdempotencyRepositoryMongoAdapter(mongoClient, mongoDbName);

    await RabbitMQAdapter.connect(rabbitmq);
    const rabbitMq = new RabbitMQAdapter();

    let eventBus: EventBus = new EventBusMessageBrokerAdapter(rabbitMq);
    eventBus = new OutboxEventBusDecorator(outboxRepository, eventBus);
    eventBus = new IdempotencyEventBusDecorator(idempotencyRepository, eventBus);

    return eventBus;
}
