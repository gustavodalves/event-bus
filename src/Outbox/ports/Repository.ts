import { Outbox } from '../Model';

export interface OutboxRepository {
    publish(event: Outbox): Promise<void>;
    update(event: Outbox): Promise<void>;
}
