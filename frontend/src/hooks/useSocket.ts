import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';
import { authService } from '../services/auth';

interface LocationUpdate {
  distressId: string;
  userId: string;
  coordinates: [number, number];
  timestamp: string;
}

interface UseSocketOptions {
  distressId?: string;
  onLocationUpdate?: (data: LocationUpdate) => void;
  onVetResponse?: (data: { distressId: string; response: unknown }) => void;
  onDistressUpdated?: (data: { distressId: string }) => void;
  onResponseAccepted?: (data: { distressId: string }) => void;
  onResponseDeclined?: (data: { distressId: string }) => void;
  onDistressResolved?: (data: { distressId: string }) => void;
  onNewDistress?: (data: { distressId: string; location: [number, number] }) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const {
    distressId,
    onLocationUpdate,
    onVetResponse,
    onDistressUpdated,
    onResponseAccepted,
    onResponseDeclined,
    onDistressResolved,
    onNewDistress,
  } = options;

  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (distressId) {
        socket.emit('join-distress', distressId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('location-updated', (data: LocationUpdate) => {
      onLocationUpdate?.(data);
    });

    socket.on('vet-response', (data: { distressId: string; response: unknown }) => {
      onVetResponse?.(data);
    });

    socket.on('distress-updated', (data: { distressId: string }) => {
      onDistressUpdated?.(data);
    });

    socket.on('response-accepted', (data: { distressId: string }) => {
      onResponseAccepted?.(data);
    });

    socket.on('response-declined', (data: { distressId: string }) => {
      onResponseDeclined?.(data);
    });

    socket.on('distress-resolved', (data: { distressId: string }) => {
      onDistressResolved?.(data);
    });

    socket.on('new-distress', (data: { distressId: string; location: [number, number] }) => {
      onNewDistress?.(data);
    });

    return () => {
      if (distressId) {
        socket.emit('leave-distress', distressId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    distressId,
    onLocationUpdate,
    onVetResponse,
    onDistressUpdated,
    onResponseAccepted,
    onResponseDeclined,
    onDistressResolved,
    onNewDistress,
  ]);

  const emitLocationUpdate = useCallback(
    (data: Omit<LocationUpdate, 'timestamp'>) => {
      socketRef.current?.emit('location-update', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    },
    []
  );

  const joinDistress = useCallback((id: string) => {
    socketRef.current?.emit('join-distress', id);
  }, []);

  const leaveDistress = useCallback((id: string) => {
    socketRef.current?.emit('leave-distress', id);
  }, []);

  return {
    isConnected,
    emitLocationUpdate,
    joinDistress,
    leaveDistress,
    socket: socketRef.current,
  };
};
