import { IDomainEvent } from '../../DomainEvent';
import { Envelope } from './Envelope';

export interface EventBus {
  publish(event: IDomainEvent): Promise<void>;
  consume<T extends IDomainEvent>(
    eventName: string,
    source: string,
    callback: (event: Envelope<T>) => Promise<void>
  ): Promise<void>;
}
