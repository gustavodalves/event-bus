import { randomUUID } from 'node:crypto';

export interface IDomainEvent {
    eventName: string
    domainEventId: string
}

export class BaseDomainEvent implements IDomainEvent {
    readonly domainEventId: string = randomUUID();

    constructor(
        public readonly eventName: string
    ) {}
}
