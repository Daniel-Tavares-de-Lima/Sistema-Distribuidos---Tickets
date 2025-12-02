// src/utils/eventPublisher.js
const { producer, isConnected } = require('../config/kafka');

class EventPublisher {
  async publish(topic, payload, key = null) {
    // Se Kafka não estiver conectado, apenas loga e continua
    if (!isConnected()) {
      console.log(`Kafka indisponível. Evento ${topic} não foi publicado.`);
      return false;
    }

    try {
      const message = {
        topic,
        messages: [
          {
            key: key ? String(key) : null,
            value: JSON.stringify({
              ...payload,
              timestamp: new Date().toISOString(),
              source: 'ticket-api'
            }),
            headers: {
              'event-type': topic,
              'content-type': 'application/json'
            }
          }
        ]
      };

      await producer.send(message);
      
      console.log(`Evento publicado: ${topic}`, { ticket_id: payload.ticket_id || 'N/A' });

      return true;
    } catch (error) {
      console.error(`Erro ao publicar evento ${topic}:`, error.message);
      return false;
    }
  }

  async publishTicketCreated(ticket, creator, form) {
    return this.publish('ticket.created', {
      ticket_id: ticket.id_ticket,
      creator_id: ticket.creator_id,
      creator_email: creator.email,
      creator_name: creator.name,
      creator_role: creator.role,
      form_id: ticket.form_id,
      form_assunto: form.assunto,
      form_benefiario: form.benefiario,
      priority: ticket.priority,
      status: ticket.status,
      notes: ticket.notes,
      created_at: ticket.created_at
    }, ticket.id_ticket);
  }

  async publishTicketUpdated(ticket, changes) {
    return this.publish('ticket.updated', {
      ticket_id: ticket.id_ticket,
      changes: changes,
      priority: ticket.priority,
      status: ticket.status,
      responsible_id: ticket.responsible_id,
      updated_at: new Date().toISOString()
    }, ticket.id_ticket);
  }

  async publishTicketAssigned(ticket, responsible) {
    return this.publish('ticket.assigned', {
      ticket_id: ticket.id_ticket,
      responsible_id: ticket.responsible_id,
      responsible_email: responsible.email,
      responsible_name: responsible.name,
      priority: ticket.priority,
      form_assunto: ticket.form?.assunto || 'N/A',
      status: ticket.status
    }, ticket.id_ticket);
  }

  async publishTicketClosed(ticket, resolutionTimeMinutes) {
    return this.publish('ticket.closed', {
      ticket_id: ticket.id_ticket,
      creator_id: ticket.creator_id,
      responsible_id: ticket.responsible_id,
      priority: ticket.priority,
      resolution_time_minutes: resolutionTimeMinutes,
      form_benefiario: ticket.form?.benefiario || 'N/A',
      created_at: ticket.created_at,
      closed_at: new Date().toISOString()
    }, ticket.id_ticket);
  }

  async publishTicketReturned(ticket) {
    return this.publish('ticket.returned', {
      ticket_id: ticket.id_ticket,
      previous_responsible_id: ticket.responsible_id,
      creator_id: ticket.creator_id,
      priority: ticket.priority,
      status: 'ABERTO',
      returned_at: new Date().toISOString()
    }, ticket.id_ticket);
  }
}

module.exports = new EventPublisher();