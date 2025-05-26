import { IDomainEvent } from '../../DomainEvent';

export interface Envelope<T extends IDomainEvent> {
  id: string;         
  eventName: string;   
  data: T;           
  metadata?: Record<string, any>; 
}
