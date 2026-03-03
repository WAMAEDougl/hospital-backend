import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    return { event: 'joined', data: room };
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    return { event: 'left', data: room };
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  sendAppointmentNotification(appointmentData: any) {
    this.server.emit('appointment-update', appointmentData);
  }

  sendBillingNotification(billingData: any) {
    this.server.emit('billing-update', billingData);
  }

  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
