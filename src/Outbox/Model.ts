import { IDomainEvent } from '../DomainEvent';

export interface Outbox<T extends IDomainEvent = IDomainEvent> {
    id: string,
    eventName: string,
    data: T,
    status: 'published' | 'pending'
}
