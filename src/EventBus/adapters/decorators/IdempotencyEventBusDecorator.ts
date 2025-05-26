import { IDomainEvent } from '../../../DomainEvent';
import { Idempotency } from '../../../Idempotency/Model';
import { IdempotencyRepository } from '../../../Idempotency/ports/Repository';
import { Envelope } from '../../ports/Envelope';
import { EventBus } from '../../ports/EventBus';

export class IdempotencyEventBusDecorator implements EventBus {
    constructor(
        private readonly idempotencyRepository: IdempotencyRepository,
        private readonly eventBus: EventBus
    ) {}

    async publish(event: IDomainEvent): Promise<void> {
        await this.eventBus.publish(event);
    }

    async consume<T extends IDomainEvent>(
        eventName: string,
        source: string,
        callback: (event: Envelope<T>) => Promise<void>
    ): Promise<void> {
        await this.eventBus.consume<T>(eventName, source, async (event) => {
            const idempotency: Idempotency = {
                id: event.id,
                eventName: event.eventName,
                data: event.data,
                consumer: source,
                status: 'consuming'
            };

            try {
                await this.idempotencyRepository.createIfNotExists(idempotency);
            } catch {
                return;
            }

            try {
                await callback(event);

                idempotency.status = 'consumed';
                await this.idempotencyRepository.update(idempotency);
            } catch (error) {
                idempotency.status = 'failed';
                await this.idempotencyRepository.update(idempotency);
                throw error;
            }
        });
    }
}
