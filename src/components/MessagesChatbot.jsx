import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import { useSocket } from "../context/SocketContext";
import axios from 'axios';

const Messages = () => {
    const chatSession = localStorage.getItem('chatSession')||"__";
    const chatSessionList = chatSession.split('_');
    
    const { socket, isConnected, reconnect } = useSocket();
    const [isMaskVisible, setIsMaskVisible] = useState((chatSession==="__"));
    const chatEndRef = useRef(null); // Reference for scrolling
    const [message, setMessage] = useState('');
    const [name, setName] = useState(chatSessionList?.name);
    const [room, setRoom] = useState(chatSessionList?.room);
    const [messages, setMessages] = useState([]);
    const [activity, setActivity] = useState('');
    
    const chatDisplayRef = useRef(null);

    // useEffect(() => {
    //     if (!isConnected) {
    //         reconnect();
    //     }
    // }, [isConnected, reconnect]);    

    useEffect(() => {
        if (chatSession) {
            const [name, room, userId] = chatSession.split('_');
            handleLoadMessages(name, room, userId); // Join the existing room and load messages
        }
    },[chatSession, socket])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  
    useEffect(() => {
        if (!socket) return;
        socket.on('message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            if (chatDisplayRef.current) {
                chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
            }
        });
        
        const userId = chatSessionList?.userId;
        socket.on('activity', (name, userId) => {
            setActivity(`${name} is typing...`);
            setTimeout(() => setActivity(''), 3000);
        });
    
        return () => {
            socket.disconnect({name, room});
            setMessages([])
        };
    }, [socket]);
  
    const handleSendMessage = (e) => {
        const [name, room, userId] = chatSession.split('_');
        e.preventDefault();
        if (name && message && userId) {
            socket.emit('message', { name, text: message,userId, position: "CLIENT" });
            setMessage('');
        }
    };
  
  
    const handleTyping = () => {
        const [name, room, userId] = chatSession.split('_');
        socket.emit('activity', name, userId);
    };
  
    const startConversation = () => {
        const randomName = `User${Math.floor(Math.random() * 1000)}`; // Generate random name
        const roomId = uuidv4(); // Generate random UUID for room ID
        const userId = uuidv4(); // Generate random UUID for room ID

        handleEnterRoom(randomName, roomId, userId); // Call your enter room function
        setIsMaskVisible(false); // Hide the mask
        setName(randomName);
        setRoom(roomId);
    };

    const handleEnterRoom = (name, room, userId) => {
        if (socket) {
            socket.emit('enterRoom', { name, room, userId }); // Emit the enterRoom event
            localStorage.setItem('chatSession', `${name}_${room}_${userId}`);
        }
    };

    const handleLoadMessages = (name, room, userId) => {
        if (socket) {
            socket.emit('enterRoom', { name, room, userId }); // Emit the enterRoom event
            fetchMessagesForRoom(room, userId ); // Fetch messages for the room
        }
    }

    // Function to fetch messages when joining a room
    const fetchMessagesForRoom = async (room, userId ) => {
        try {
            const response = await axios.get(`http://localhost:3500/api/messages`, {
                params: {
                    roomId: room,
                    userId: userId
                }
            });
            const messages = response.data;
            setMessages((prevMessages) => [...prevMessages, ...messages]);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    return (
        <div className="flex-grow h-full flex flex-col">
            <div className="w-full h-15 p-1 bg-purple-600 shadow-md rounded-xl rounded-bl-none rounded-br-none">
                <div className="flex p-2 align-middle items-center">
                    <div className="flex-grow p-2">
                        <div className="text-md text-white font-semibold">Test Chatbot</div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <div className="text-xs text-white ml-1">Online</div>
                        </div>
                    </div>
                    <div className="p-2 text-white cursor-pointer hover:bg-purple-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="w-full min-h-[400px] max-h-[500px] flex-grow bg-gray-100 p-2 overflow-y-auto relative">
                {isMaskVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                        <button
                            onClick={startConversation}
                            className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-500"
                        >
                            Start Conversation
                        </button>
                    </div>
                )}
                {messages.map((message, index) => {
                    const {text, type, userName, message: msg} = message;
                    const nameDefault = chatSession.split('_')?.[0];
                    
                    if(userName!== nameDefault) {
                        return (
                            <MessageLeft key={index} message={text||msg} />
                        )
                    } else {
                        return (
                            <MessageRight key={index} message={text||msg} />
                        )
                    }
                })}
                <div ref={chatEndRef} />
            </div>

            <div className="h-15 p-3 rounded-xl rounded-tr-none rounded-tl-none bg-gray-100">
                <div className="flex items-center">
                    <div className="p-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="search-chat flex flex-grow p-2">
                    <form className="search-chat flex flex-grow p-2" onSubmit={handleSendMessage}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleTyping}
                    disabled={isMaskVisible}
                className="input text-gray-700 text-sm p-5 focus:outline-none bg-white flex-grow rounded-l-md" type="text" placeholder="Type your message ..." />
                        <button type="submit" className="bg-white flex justify-center items-center pr-3 text-gray-400 rounded-r-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
            </form>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;

const MessageLeft = ({ message }) => {
    return (
        <div className="flex justify-start w-full">
            <div className="p-3 bg-purple-300 mx-3 my-1 rounded-2xl rounded-bl-none w-3/4">
                <div className="text-gray-700">
                    {message}
                </div>
            </div>
        </div>
    );
};

const MessageRight = ({ message }) => {
    return (
        <div className="flex justify-end w-full">
            <div className="p-3 bg-purple-300 mx-3 my-1 rounded-2xl rounded-br-none w-3/4">
                <div className="text-gray-700">
                    {message}
                </div>
            </div>
        </div>
    );
};