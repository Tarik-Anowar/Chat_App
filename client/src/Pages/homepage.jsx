import React, { useEffect } from "react";
import { Container, Box, Text, Tab, Tabs, TabList, TabPanel, TabPanels } from '@chakra-ui/react'
import Signup from "../components/Authentication/signup";
import Login from "../components/Authentication/login";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const HomePage = () => {
    const history = useHistory();
    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if(user) history.push("/chats");
    },[history]);
    return (
        <Container>
            <Box
                d='flex'
                justifyContent="center"
                p={3}
                bg={"white"}
                w="100%"
                m="40px 0 15px 0"
                borderRadius="15px"
                borderWidth="1px"
            >
                <Text
                    fontSize="4xl" fontFamily="Work sans" textAlign="center" color="black"
                >Let's chat</Text>
            </Box>
            {/* এস গল্প করি */}
            <Box
                bg="white"
                w="100%"
                p={4}
                borderRadius="lg"
                color='black'
                borderWidth="1px"
            >
                <Tabs variant='soft-rounded'>
                    <TabList mb='1em'>
                        <Tab width="50%">Login</Tab>
                        <Tab width="50%">Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login/>
                        </TabPanel>
                        <TabPanel>
                           <Signup/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </Box>
        </Container>
    )
}

export default HomePage;