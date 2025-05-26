export interface MessageBroker {
    publish(eventName: string, data: unknown): Promise<void>
    consume<T = unknown>(
        eventName: string,
        source: string,
        callback: (event: T) => Promise<void>
    ): Promise<void>
}
