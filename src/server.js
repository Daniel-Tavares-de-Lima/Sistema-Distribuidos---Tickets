const app = require('./app');
const { connectProducer, createTopics, disconnectProducer } = require('./config/kafka');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Conectar ao Kafka (não bloqueia se falhar)
    await connectProducer();
    await createTopics();

    // 2. Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` http://localhost:${PORT}`);
      console.log(` Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // 3. Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} recebido, encerrando gracefully...`);
      
      server.close(async () => {
        console.log(' Servidor HTTP fechado');
        
        await disconnectProducer();
        console.log(' Kafka desconectado');
        
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️ Forçando saída...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error(' Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();