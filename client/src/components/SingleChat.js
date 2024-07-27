import React, { useRef, useEffect, useState } from "react";
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../context/ChatProvider";
import ProfileModal from "./Mislanious/ProfileModal";
import UpdateChatModal from "./Mislanious/UpdateChatModal";
import axios from 'axios';
import './styles.css';
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client"

const ENDPOINT = `https://chat-app-sever-git-main-tarik-anowars-projects.vercel.app/`;

var socket,selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat } = ChatState();
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessgae, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [socketConnected,setSocketConnected] = useState(false);
    useEffect(() => {
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
        socket.on("message received", (newMessage) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessage.chat._id) {
                // Give notification;
            } else {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        });
    
        return () => {
            socket.off("message received");
        };
    }, [selectedChatCompare]);
    

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    const toast = useToast();





    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessgae) {
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post("/api/message", {
                    content: newMessgae,
                    chatId: selectedChat._id,
                }, config);
                setMessages([...messages, data]);
                socket.emit("new message",data);
            } catch (error) {
                toast({
                    title: "Error Loading messages",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }
        }
    };
    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // Typing indicator logic
    }

    const fetchMessages = async()=>{
        if(!selectedChat) return;
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);
            const {data} = await axios.get(`/api/message/${selectedChat._id}`,config)
            setMessages(data);
            console.log(messages);
            setLoading(false);
            socket.emit('join chat',selectedChat._id);
        } catch (error) {
            toast({
                title:"Error Occurred",
                description:"Failed to load the Messages",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom",
            })
        }
    }
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
                    >
                        <IconButton
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                            aria-label="Go Back"
                        />
                        {selectedChat.isGroup ? (
                            <>
                                <Text>{selectedChat.chatName ? selectedChat.chatName.toUpperCase() : ""}</Text>
                                <UpdateChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={sendMessage}/>
                            </>
                        ) : (
                            <>
                                {selectedChat.users[0].name === user.name ? selectedChat.users[1].name : selectedChat.users[0].name}
                                <ProfileModal user={selectedChat.users[0].name === user.name ? selectedChat.users[1] : selectedChat.users[0]} />
                            </>
                        )}
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
                        {loading ?
                            (<Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />) :
                            (<div className="messages">
                               <ScrollableChat messages = {messages}/> 
                            </div>)}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            <Input
                                varient="filled"
                                bg="ragba(200,200,200,1)"
                                placeholder="Write message..."
                                onChange={typingHandler}
                                value={newMessgae}
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
