import React, { useState } from "react";
import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuDivider, MenuItem, Drawer, useDisclosure, DrawerOverlay, DrawerHeader, DrawerContent, DrawerBody, Input, useToast, Spinner } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import SuprSendInbox, { bellComponent, backgroundColor, SuprSendProvider } from "@suprsend/react-inbox";
// import { useUnseenCount } from "@suprsend/react-inbox";
// import { useNotifications } from "@suprsend/react-inbox";


const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const history = useHistory();
    const toast = useToast();
    // const { unSeenCount, markAllSeen } = useUnseenCount();
    // const {notifications, markClicked, markAllRead, initialLoading, hasNext, fetchPrevious, fetchMoreLoading } = useNotifications(storeId)

    const { user, setSelectedChat, chats, setChats } = ChatState();

    const { isOpen, isClose, onOpen, onClose } = useDisclosure();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                position: "top-left",
                title: 'Please enter some thing to search',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config)

            setSearchResult(data);
            setLoading(false);


        }
        catch (err) {
            toast({
                position: "top-left",
                title: 'Failed to search Results',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.post('/api/chat', { userId }, config);

            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();

        } catch (error) {
            toast({
                position: "top-left",
                title: 'Failed to load Chat',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setLoadingChat(false);
        }
    }


    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                width="100%"
                padding="5px 10px"
                borderWidth="5px"
            >
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="lni lni-search-alt"></i>
                        <Text display={{ base: "none", md: "flex" }} paddingLeft={4}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    Chat-App
                </Text>
                <div>
                    <Menu>
                           <SuprSendInbox
                                bellComponent={() => <BellIcon fontSize="3xl" m="1" />}
                                workspaceKey="2cZImFSEpYicveWYVK4JE"
                                subscriberId={user.subscriber_id}
                                distinctId={user.email}
                            />
                           
                        {/* <MenuList></MenuList> */}
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>{" "}
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>

                    </Menu>
                </div>
            </Box>


            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
                    <DrawerBody>
                        <Box
                            d='flex'
                            flexDir={{ base: 'row', md: 'row' }}
                            pb={2}
                            alignItems="center" // Align items to the center
                            width="100%"
                        >
                            <Input
                                placeholder="Search By name or email"
                                onChange={(e) => setSearch(e.target.value)}
                                maxWidth="78%"
                            />
                            <Button ml="2px" onClick={handleSearch}>
                                Go
                            </Button>
                        </Box>

                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map(user => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" d="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default SideDrawer;
