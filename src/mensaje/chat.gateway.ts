import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UnauthorizedException, Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userName?: string;
}

@WebSocketGateway({
    cors: {
        origin: '*', // Configure according to your needs
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly mensajeService: MensajeService) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract token from handshake
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                throw new UnauthorizedException('No token provided');
            }

            // Here you would validate the token and extract user info
            // For now, we'll accept the userId and userRole from the client
            // In production, validate JWT token here
            client.userId = client.handshake.auth.userId;
            client.userRole = client.handshake.auth.userRole;
            client.userName = client.handshake.auth.userName;

            this.logger.log(`Client connected: ${client.id}, userId: ${client.userId}, userName: ${client.userName}`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @MessageBody() data: { reclamoId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            const roomName = `reclamo-${data.reclamoId}`;
            await client.join(roomName);

            this.logger.log(`Client ${client.id} joined room ${roomName}`);

            return { success: true, room: roomName };
        } catch (error) {
            this.logger.error(`Error joining room: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(
        @MessageBody() data: { reclamoId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const roomName = `reclamo-${data.reclamoId}`;
        await client.leave(roomName);

        this.logger.log(`Client ${client.id} left room ${roomName}`);

        return { success: true };
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() createMensajeDto: CreateMensajeDto,
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!client.userId || !client.userRole) {
                throw new UnauthorizedException('User not authenticated');
            }

            // Save message to database
            const mensaje = await this.mensajeService.create(
                createMensajeDto,
                client.userId,
                client.userRole,
                client.userName
            );

            // Broadcast to room
            const roomName = `reclamo-${createMensajeDto.reclamoId}`;
            this.server.to(roomName).emit('newMessage', mensaje);

            this.logger.log(`Message sent to room ${roomName}`);

            return { success: true, mensaje };
        } catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { reclamoId: string; isTyping: boolean },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const roomName = `reclamo-${data.reclamoId}`;

        // Broadcast typing indicator to others in the room
        client.to(roomName).emit('userTyping', {
            userId: client.userId,
            isTyping: data.isTyping,
        });

        return { success: true };
    }
}
