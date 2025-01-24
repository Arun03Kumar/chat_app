import http from 'http';
import { Server } from 'socket.io';

export default {
  register() {},

  bootstrap({ strapi }) {
    const server = http.createServer(strapi.server.app.callback());
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      console.log(`Socket connected: ${socket.id} for user: ${userId}`);

      // Add the user to a room identified by their user ID
      socket.join(userId);

      // Handle send_message event
      socket.on('send_message', async (data) => {
        const { content, senderId, receiverId } = data;

        try {
          // Step 1: Check if a conversation exists between the users
          let conversation = await strapi.entityService.findMany(
            'api::conversation.conversation',
            {
              filters: {
                participants: {
                  id: { $in: [senderId, receiverId] },
                },
              },
              populate: ['participants'],
            }
          );

          // Step 2: If no conversation exists, create a new one
          if (conversation.length === 0) {
            conversation = await strapi.entityService.create(
              'api::conversation.conversation',
              {
                data: {
                  Title: `Conversation between ${senderId} and ${receiverId}`,
                  participants: [senderId, receiverId],
                },
              }
            );
          } else {
            conversation = conversation[0];
          }

          // Step 3: Save the message in the conversation
          const newMessage = await strapi.entityService.create(
            'api::message.message',
            {
              data: {
                Content: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: content }],
                  },
                ],
                sender: senderId,
                conv: conversation.id,
              },
            }
          );

          console.log("Message saved:", newMessage);

          // Step 4: Emit the message to the receiver's room
          io.to(receiverId).emit('receive_message', {
            message: newMessage,
            conversationId: conversation.id,
          });

          // Step 5: Optionally acknowledge the sender
          socket.emit('message_sent', newMessage);
        } catch (error) {
          console.error('Error handling send_message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
      console.log(`Strapi backend with Socket.IO listening on port ${port}`);
    });

    strapi.io = io;
  },
};
