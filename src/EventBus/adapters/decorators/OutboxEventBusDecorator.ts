import { IDomainEvent } from '../../../DomainEvent';
import { Outbox } from '../../../Outbox/Model';
import { OutboxRepository } from '../../../Outbox/ports/Repository';
import { Envelope } from '../../ports/Envelope';
import { EventBus } from '../../ports/EventBus';

export class OutboxEventBusDecorator implements EventBus {
    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly eventBus: EventBus
    ) {}

    async publish(event: IDomainEvent): Promise<void> {
        const outbox: Outbox = {
            id: event.domainEventId,
            eventName: event.eventName,
            data: event,
            status: 'pending'
        };

        await this.outboxRepository.publish(outbox);
        await this.eventBus.publish(event);

        outbox.status = 'published';
        await this.outboxRepository.update(outbox);
    }

    async consume<T extends IDomainEvent>(eventName: string, source: string, callback: (event: Envelope<T>) => Promise<void>): Promise<void> {
        await this.eventBus.consume(eventName, source, callback);
    }
}
