import Ably from 'ably';

// Dummy key cho development/build - thay thế bằng real API key từ environment variables
const DEFAULT_KEY = 'dummy.key:dummy-key-for-development-build';

// Client-side Ably configuration 
const ably = typeof window !== 'undefined' ? new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_KEY || DEFAULT_KEY,
  clientId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
}) : null;

export default ably;

// Server-side Ably client for API routes
export const serverAbly = new Ably.Realtime({
  key: process.env.ABLY_SERVER_KEY || process.env.NEXT_PUBLIC_ABLY_KEY || DEFAULT_KEY,
  clientId: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

// Helper function to publish messages to a channel
export const publishToChannel = async (channelName: string, eventName: string, data: any) => {
  try {
    const channel = serverAbly.channels.get(channelName);
    await channel.publish(eventName, data);
    console.log(`[Ably] Published ${eventName} to channel ${channelName}:`, data);
  } catch (error) {
    console.error(`[Ably] Error publishing to ${channelName}:`, error);
  }
};

// Helper function to broadcast board events
export const broadcastToBoard = async (boardId: string, event: { type: string; data: any }) => {
  const channelName = `board:${boardId}`;
  await publishToChannel(channelName, event.type, event.data);
}; 