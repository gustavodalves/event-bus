# EventBus

Este projeto implementa uma arquitetura para consumo e publicação de eventos com suporte a idempotência, padrão outbox, utilizando RabbitMQ como message broker.

---

## Visão Geral

- **IdempotencyEventBusDecorator**: Decorator para o EventBus que garante que eventos sejam consumidos apenas uma vez, armazenando o status no repositório de idempotência.
- **OutboxEventBusDecorator**: Decorator para o EventBus que persiste eventos na tabela outbox antes de publicar, garantindo confiabilidade e rastreabilidade.
- **RabbitMQAdapter**: Adapter para integração com RabbitMQ, com setup automático de exchanges, filas e dead letter queues, além de controle de prefetch e tratamento de mensagens.

---