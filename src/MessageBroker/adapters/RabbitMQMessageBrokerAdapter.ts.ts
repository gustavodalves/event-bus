import amqp, { Options as AmqpOptions } from 'amqplib';
import { MessageBroker } from '../ports/MessageBroker';

export type RabbitMQType = 'fanout' | 'direct' | 'topic' | 'headers';

export interface Options extends AmqpOptions.Connect {
  protocol?: string;
  prefetch?: number
}

export class RabbitMQAdapter implements MessageBroker {
    private static _connection?: any;
    private static _channel?: any;
    private static prefetch: number = 2;

    private get channel(): amqp.Channel {
        if (!RabbitMQAdapter._channel) {
            throw new Error('Channel not initialized');
        }
        return RabbitMQAdapter._channel;
    }

    static async connect(options: Options) {
        if (!this._connection) {
            this._connection = await amqp.connect(options);
            this._channel = await this._connection!.createChannel();
            this.prefetch = options.prefetch || this.prefetch;
            this._channel?.prefetch(this.prefetch);

            this._channel.on('close', async () => {
                this._channel = await this._connection?.createChannel();
            });
        }
    }

    private toSnakeCase(str: string) {
        return str
            .replace(/([A-Z])/g, '_$1') 
            .replace(/_{2,}/g, '_')     
            .replace(/^_/, '')           
            .toLowerCase();         
    }

    private routingKey() {
        return ''; 
    }

    private deadLetterExchange(eventName: string) {
        return `${this.toSnakeCase(eventName).toUpperCase()}_DLX`;
    }

    private deadLetterQueue(queueName: string) {
        return `${this.toSnakeCase(queueName)}_DLQ`;
    }

    private exchangeName(eventName: string) {
        return `${this.toSnakeCase(eventName).toUpperCase()}`;
    }

    private async setupExchange(eventName: string) {
        await this.channel.assertExchange(this.exchangeName(eventName), 'fanout', { durable: true });
        await this.channel.assertExchange(this.deadLetterExchange(eventName), 'fanout', { durable: true });
    }

    private async setupQueue(eventName: string, queueName: string, source: string) {
        await this.setupExchange(eventName);

        const mainQueue = this.toSnakeCase(`${source}_${(queueName)}`);
        const dlq = this.deadLetterQueue(mainQueue);

        await this.channel.assertQueue(dlq, { durable: true });
        await this.channel.bindQueue(dlq, this.deadLetterExchange(eventName), this.routingKey());

        await this.channel.assertQueue(mainQueue, {
            durable: true,
            deadLetterExchange: this.deadLetterExchange(eventName),
            deadLetterRoutingKey: this.routingKey()
        });

        await this.channel.bindQueue(mainQueue, this.exchangeName(eventName), this.routingKey());

        return mainQueue;
    }

    async publish(eventName: string, event: unknown): Promise<void> {
        const bufferedData = Buffer.from(JSON.stringify(event));
        await this.setupExchange(eventName);
        this.channel.publish(this.exchangeName(eventName), this.routingKey(), bufferedData);
    }

    async consume<T = unknown>(
        eventName: string,
        source: string,
        callback: (event: T) => Promise<void>
    ) {
        const mainQueue = await this.setupQueue(eventName, source, eventName);

        this.channel.consume(mainQueue, async (message) => {
            if (!message) return;
            try {
                const content: T = JSON.parse(message.content.toString());
                await callback(content);
                this.channel.ack(message);
            } catch (err) {
                this.channel.nack(message, false, false);
            }
        });
    }
}
