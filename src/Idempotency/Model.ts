import { IDomainEvent } from '../DomainEvent';

export interface Idempotency {
    id: string,
    eventName: string,
    data: IDomainEvent,
    consumer: string,
    status: 'consumed' | 'consuming' | 'pending' | 'failed'
}
