import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Critical SSE headers với explicit flushing
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    // Critical for immediate delivery
    'X-Accel-Buffering': 'no',
  });

  // Send initial message IMMEDIATELY with manual flush
  res.write('data: {"type":"connected","message":"SSE connected successfully"}\n\n');
  res.flushHeaders?.(); // Force header flush
  
  // Send test message after 1 second
  setTimeout(() => {
    try {
      res.write('data: {"type":"test","message":"Test message after 1 second","timestamp":' + Date.now() + '}\n\n');
      // CRITICAL: Force flush the data
      if ((res as any).flush) (res as any).flush();
    } catch (error) {
      console.error('Failed to send test message:', error);
    }
  }, 1000);

  // Send periodic messages
  const interval = setInterval(() => {
    try {
      res.write('data: {"type":"ping","timestamp":' + Date.now() + '}\n\n');
      // CRITICAL: Force flush each message
      if ((res as any).flush) (res as any).flush();
    } catch (error) {
      console.error('Failed to send ping:', error);
      clearInterval(interval);
    }
  }, 3000);

  // Handle disconnect
  req.on('close', () => {
    console.log('Client disconnected from simple SSE test');
    clearInterval(interval);
  });

  req.on('error', (err) => {
    console.error('SSE connection error:', err);
    clearInterval(interval);
  });
} 