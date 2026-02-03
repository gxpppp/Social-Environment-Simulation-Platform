import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'simulations',
})
export class SimulationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SimulationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, sessionId: string) {
    client.join(sessionId);
    this.logger.log(`Client ${client.id} joined session ${sessionId}`);
    return { event: 'joined', data: sessionId };
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, sessionId: string) {
    client.leave(sessionId);
    this.logger.log(`Client ${client.id} left session ${sessionId}`);
    return { event: 'left', data: sessionId };
  }

  @SubscribeMessage('control')
  handleControl(client: Socket, payload: { sessionId: string; action: string; data?: any }) {
    this.logger.log(`Control action: ${payload.action} for session ${payload.sessionId}`);
    // 广播控制命令到所有订阅该会话的客户端
    this.server.to(payload.sessionId).emit('control', payload);
    return { event: 'control-ack', data: payload };
  }

  // 向特定会话广播事件
  broadcastEvent(sessionId: string, event: string, data: any) {
    this.server.to(sessionId).emit(event, data);
  }

  // 广播模拟状态更新
  broadcastStatus(sessionId: string, status: any) {
    this.broadcastEvent(sessionId, 'status', status);
  }

  // 广播Agent事件
  broadcastAgentEvent(sessionId: string, event: any) {
    this.broadcastEvent(sessionId, 'agent-event', event);
  }
}
