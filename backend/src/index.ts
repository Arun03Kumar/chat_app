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

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] User connected: Socket ID: ${socket.id}`);

      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`[Socket.IO] User joined room: ${conversationId}`);
      });

      // Handle send_message event
      socket.on('send_message', async (data) => {
        console.log(`[Socket.IO] Received message:`, data);
        console.log(`[Socket.IO] User ${socket.handshake.query.userId} id:${socket.id}`);

        const { content, senderId, receiverId, conversationId } = data;

        try {
          // Step 1: Check if a conversation exists
          // let conversation = await strapi.entityService.findMany(
          //   'api::conversation.conversation',
          //   {
          //     filters: {
          //       participants: {
          //         id: { $in: [senderId, receiverId] },
          //       },
          //     },
          //     populate: ['participants'],
          //   }
          // );
          // console.log(`[Socket.IO] Fetched conversation:`, conversation);

          // // Step 2: If no conversation exists, create a new one
          // if (conversation.length === 0) {
          //   console.log(`[Socket.IO] No conversation found. Creating a new one.`);
          //   conversation = await strapi.entityService.create(
          //     'api::conversation.conversation',
          //     {
          //       data: {
          //         Title: `Conversation between ${senderId} and ${receiverId}`,
          //         participants: [senderId, receiverId],
          //       },
          //     }
          //   );
          //   console.log(`[Socket.IO] Created conversation:`, conversation);
          // } else {
          //   conversation = conversation[0];
          //   console.log(`[Socket.IO] Existing conversation found:`, conversation);
          // }

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
                // conv: conversation.id,
                conv: conversationId,
              },
            }
          );
          console.log(`[Socket.IO] Message saved:`, newMessage);

          // Step 4: Emit the message to the conversation room
          socket.to(conversationId).emit('receive_message', {
            message: newMessage,
            // conversationId: conversation.id,
            conversationId: conversationId,
          });
          // console.log(`[Socket.IO] Message emitted to room: ${conversation.id}`);
          console.log(`[Socket.IO] Message emitted to room: ${conversationId}`);

          // Step 5: Optionally confirm to the sender
          socket.emit('message_sent', newMessage);
          console.log(`[Socket.IO] Message confirmed to sender: ${senderId}`);
        } catch (error) {
          console.error(`[Socket.IO] Error handling send_message:`, error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Socket disconnected: ${socket.id}`);
      });
    });

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
      console.log(`[Socket.IO] Server listening on port ${port}`);
    });

    strapi.io = io;
  },
};
