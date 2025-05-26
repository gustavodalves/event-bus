import { Idempotency } from '../Model';

export interface IdempotencyRepositoryInput {
    id: string, source: string
}

export interface IdempotencyRepository {
    createIfNotExists(event: Idempotency): Promise<void>
    update(input: Idempotency): Promise<void>
}
