import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (url = 'http://localhost:5000') => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
};

export default useSocket;