import React, { useEffect, useState } from "react";
import {
    useDisclosure,
    useToast,
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Spinner,
    Text,
    FormControl,
    Input,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";
import io from "socket.io-client";

const ENDPOINT = `http://${window.location.host}`;

let socket;

const StatusModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const { user } = ChatState();
    const [statuses, setStatuses] = useState([]);
    const toast = useToast();
    const [status, setStatus] = useState("");    

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.on("broadcast", (newStatus) => {
            setStatuses(prevStatuses => [...prevStatuses, newStatus]);
        });
        return () => {
            socket.off("broadcast");
        };
    }, []);
    

    useEffect(() => {
        fetchStatus();
    }, []);

    

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/message/allstatus", config);
            setStatuses(data);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occurred",
                description: "Failed to Load Statuses",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
        }
    };

    const typingHandler = (e) => {
        setStatus(e.target.value);
    };

    const postStatus = async (e) => {
        if (e.key === "Enter" && status) {
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.post("/api/message/poststatus", { content: status }, config);

                setStatus("");
                setStatuses([...statuses, data]);
                socket.emit("new status", data);

                toast({
                    title: `${data}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    toast({
                        title: "Error Occurred",
                        description: error.response.data.error,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: "Error Occurred",
                        description: "Failed to Post Status",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
        }
    };

    return (
        <>
            <Button onClick={onOpen}>Status</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Statuses</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <Box p={3} overflowY="auto" minHeight={500} maxHeight={500}>
                                {statuses.map((status) => (
                                    <Box key={status._id} borderRadius="2px" m={1} bgColor="rgba(0, 0, 0, 0.5)" p={2} cursor="pointer">
                                        <Text color="white">{status.content}</Text>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter justifyContent="space-between">
                        <FormControl flex="1" isRequired mt={3}>
                            <Input
                                variant="filled"
                                bg="rgba(200, 200, 200, 1)"
                                placeholder="Write your status..."
                                onChange={typingHandler}
                                value={status}
                                onKeyDown={postStatus}
                            />
                        </FormControl>
                        <Button colorScheme="blue" variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default StatusModal;
