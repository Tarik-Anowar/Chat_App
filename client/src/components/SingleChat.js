import React, { useRef, useEffect, useState } from "react";
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../context/ChatProvider";
import ProfileModal from "./Mislanious/ProfileModal";
import UpdateChatModal from "./Mislanious/UpdateChatModal";
import axios from 'axios';
import './styles.css';
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = `https://chat-app-sever-theta.vercel.app/`;

let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat } = ChatState();
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const toast = useToast();

    useEffect(() => {
        // Initialize socket connection
        socket = io(ENDPOINT);

        socket.emit("setup", user);

        socket.on("connect", () => {
            setSocketConnected(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (selectedChat) {
            // Join the chat room when a chat is selected
            socket.emit("join chat", selectedChat._id);
            
            // Fetch messages for the selected chat
            fetchMessages();

            // Listen for incoming messages
            socket.on("message received", (newMessage) => {
                if (selectedChat && selectedChat._id === newMessage.chat._id) {
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                }
            });

            return () => {
                socket.off("message received");
            };
        }
    }, [selectedChat]);

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    withCredentials: true,
                };
                setNewMessage("");
                const { data } = await axios.post("/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, config);
                setMessages([...messages, data]);
                socket.emit("new message", data);
            } catch (error) {
                toast({
                    title: "Error Sending Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // Typing indicator logic can be added here
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                withCredentials: true,
            };

            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Loading Messages",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    return (
        <div>
            {selectedChat ? (
                <>
                    <Box
                        ref={headerRef}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={1}
                        bg="rgba(200, 200, 200, 0.9)"
                        color="black"
                        boxShadow="md"
                        borderRadius={5}
                        position="relative"
                    >
                        <IconButton
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat(null)}
                            aria-label="Go Back"
                        />
                        <Box display="flex" alignItems="center" flex="1" justifyContent="center">
                            {selectedChat.isGroup ? (
                                <>
                                    <Text fontWeight="bold" mr={2}>
                                        {selectedChat.chatName ? selectedChat.chatName.toUpperCase() : ""}
                                    </Text>
                                    <UpdateChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                </>
                            ) : (
                                <>
                                    <Text mr={2}>
                                        {selectedChat.users[0].name === user.name ? selectedChat.users[1].name : selectedChat.users[0].name}
                                    </Text>
                                    <ProfileModal user={selectedChat.users[0].name === user.name ? selectedChat.users[1] : selectedChat.users[0]} />
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        height={`calc(91.5vh - ${headerHeight}px)`}
                        backgroundColor="rgba(18,140,126,1)"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={2}
                        w="100%"
                        borderRadius="1px"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            <Input
                                variant="filled"
                                bg="rgba(200, 200, 200, 1)"
                                placeholder="Write message..."
                                onChange={typingHandler}
                                value={newMessage}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100vh"
                >
                    <Text
                        fontSize="3xl"
                        pb={3}
                        fontFamily="Work Sans"
                        textAlign="center"
                    >
                        {user.name} Click on a User or Group to start chat
                    </Text>
                </Box>
            )}
        </div>
    );
};

export default SingleChat;
