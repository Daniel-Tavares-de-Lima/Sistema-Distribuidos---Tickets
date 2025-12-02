// src/config/kafka.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ticket-api',
  brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

const admin = kafka.admin();

let producerConnected = false;

const connectProducer = async () => {
  if (!producerConnected) {
    try {
      await producer.connect();
      producerConnected = true;
      console.log('✅ Kafka Producer conectado');
    } catch (error) {
      console.error('❌ Erro ao conectar Kafka Producer:', error.message);
      console.log('⚠️ Sistema continuará sem Kafka (modo degradado)');
    }
  }
};

const createTopics = async () => {
  try {
    await admin.connect();
    
    const existingTopics = await admin.listTopics();
    const requiredTopics = [
      'ticket.created',
      'ticket.updated',
      'ticket.assigned',
      'ticket.closed',
      'ticket.returned'
    ];

    const topicsToCreate = requiredTopics
      .filter(topic => !existingTopics.includes(topic))
      .map(topic => ({
        topic,
        numPartitions: 3,
        replicationFactor: 1
      }));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true
      });
      console.log('✅ Tópicos Kafka criados:', topicsToCreate.map(t => t.topic).join(', '));
    } else {
      console.log('✅ Todos os tópicos Kafka já existem');
    }

    await admin.disconnect();
  } catch (error) {
    console.error('❌ Erro ao criar tópicos Kafka:', error.message);
  }
};

const disconnectProducer = async () => {
  if (producerConnected) {
    await producer.disconnect();
    producerConnected = false;
    console.log('✅ Kafka Producer desconectado');
  }
};

module.exports = {
  kafka,
  producer,
  connectProducer,
  disconnectProducer,
  createTopics,
  isConnected: () => producerConnected
};