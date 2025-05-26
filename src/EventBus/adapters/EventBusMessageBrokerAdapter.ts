import { IDomainEvent } from '../../DomainEvent';
import { MessageBroker } from '../../MessageBroker/ports/MessageBroker';
import { EventBus } from '../ports/EventBus';
import { Envelope } from '../ports/Envelope';

export class EventBusMessageBrokerAdapter implements EventBus {
    constructor(
    private readonly messageBroker: MessageBroker
    ) {}

    async publish(event: IDomainEvent): Promise<void> {
        const eventEnveloped: Envelope<IDomainEvent> = {
            id: event.domainEventId,
            data: event,
            eventName: event.eventName
        };
        await this.messageBroker.publish(event.eventName, eventEnveloped);
    }

    async consume<T extends IDomainEvent>(eventName: string, source: string, callback: (event: Envelope<T>) => Promise<void>): Promise<void> {
        await this.messageBroker.consume<Envelope<T>>(eventName, source,async (event) => {
            await callback(event);
        });
    }
}
