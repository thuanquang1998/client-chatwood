// src/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
const SOCKET_SERVER_URL = 'ws://localhost:3500'; 

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const socketIo = io(SOCKET_SERVER_URL); // Replace with your server URL
        socketIo.on('connect', () => {
            setSocket(socketIo);
            setIsConnected(true);
        });
        setSocket(socketIo);
        socketIo.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socketIo.disconnect();
        };
    }, []);

    const reconnect = useCallback(() => {
        const socketIo = io(SOCKET_SERVER_URL);
        
        socketIo.on('connect', () => {
            setIsConnected(true);
        });

        setSocket(socketIo);
        socketIo.on('disconnect', () => {
            setIsConnected(false);
        });
    }, []);

    useEffect(() => {
        if (!isConnected) {
            reconnect();
        }
    }, [isConnected, reconnect]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};