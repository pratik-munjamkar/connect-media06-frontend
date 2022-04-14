import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, Spinner, Modal, Alert } from 'react-bootstrap';
import Conversation from '../conversation/Conversation';
import Header from '../header/Header';
import Message from '../message/Message';
import axios from 'axios';
import { io } from 'socket.io-client';

import "./Messenger.css";

import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Messenger() {

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chatOptions, setChatOptions] = useState([]);
    const [message, setMessage] = useState("");
    const [currentChat, setCurrentChat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));

    const scrollRef = useRef();
    const socket = useRef();

    const [showFollowing, setShowFollowing] = useState(false);
    const handleShowFollowingClose = () => setShowFollowing(false);
    const handleShowFollowingShow = () => setShowFollowing(true);

    useEffect(() => {
        socket.current = io(process.env.REACT_APP_BACKEND);

        socket.current.on("getMessage", (data) => {

            setArrivalMessage({
                "_id": Date.now(),
                "sender": data.sender,
                "text": data.text,
                "createdAt": Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members?.find(
                (member) => member._id === arrivalMessage?.sender?._id
            ) &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        socket.current.emit("addUser", user?._id);
    }, [user?._id]);

    useEffect(() => {

        const getConversations = async () => {
            try {

                setIsLoading(true);

                const { data } = await axios.get(`/conversations`,
                    { headers: { "token": localStorage.getItem("token") } });

                setConversations([...data]);

                setIsLoading(false);

            }
            catch (err) {
                setIsLoading(false);
                toast.error("Error getting convo. Try again later");
                console.log(err);
            }
        }

        getConversations();

    }, []);

    useEffect(() => {
        //api call to get following
        const getChatSuggests = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(`/users/following/${user?._id}`,
                    { headers: { "token": localStorage.getItem("token") } });

                const conversationIds = conversations.reduce((a, c) => {
                    return [...a, c.members.find(e => e._id !== user?._id)._id]
                }, []);

                const conversationIdsObj = {};

                conversationIds.forEach(c => conversationIdsObj[c] ? conversationIdsObj[c]++ : conversationIdsObj[c] = 1);

                setChatOptions(data.filter(d => !conversationIdsObj[d._id]));
                setIsLoading(false);

            }
            catch (err) {
                setIsLoading(false);
                console.log(err);
            }
        }
        getChatSuggests();
    }, [conversations, user?._id])

    useEffect(() => {

        const getMessages = async () => {
            try {

                setIsLoading(true);

                const { data } = await axios.get(`/messages/${currentChat?._id}`,
                    { headers: { "token": localStorage.getItem("token") } });

                setIsLoading(false);
                setMessages([...data]);

            }
            catch (err) {
                setIsLoading(false);
                toast.error("Error posting message. Try again later");
                console.log(err);
            }
        }

        currentChat && getMessages();

    }, [currentChat]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async () => {

        const newMessage = {
            sender: user?._id,
            text: message,
            conversationId: currentChat?._id,
        };

        const receiverId = currentChat.members.find(
            (member) => member._id !== user?._id
        );

        try {
            const res = await axios.post(`/messages`, newMessage,
                { headers: { "token": localStorage.getItem("token") } });

            setMessages([...messages, res.data]);
            setMessage("");
            socket.current.emit("sendMessage", {
                sender: res.data.sender,
                receiverId: receiverId?._id,
                text: message,
            });

        } catch (err) {
            toast.error("Error sending message. Try again later");
            console.log(err);
        }
    };

    const startNewConversation = async (id) => {
        try {
            setIsLoading(true);
            const { data } = await axios.post(`/conversations`,
                {
                    mainUser: user?._id,
                    otherUser: id
                },
                { headers: { "token": localStorage.getItem("token") } });
            setConversations([...conversations, data]);
            handleShowFollowingClose();
            setIsLoading(false);

        } catch (err) {
            setIsLoading(false);
            toast.error("Error creating conversation. Try again later");
            console.log(err);
        }
    }
    return <>
        <Header />
        {
            isLoading ? <div className="spinnerCenter"><Spinner animation="border" /> </div> :
                <Container>
                    <Modal show={showFollowing} onHide={handleShowFollowingClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>start a conversation with...</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="chatSuggestionsListDiv">
                                {chatOptions?.length === 0 && <Alert variant="danger" className="followedAlert">
                                    follow new people to start new conversation!
                                </Alert>}
                                <ul className="chatSuggestionsList">
                                    {
                                        chatOptions?.map(f => {
                                            return <li key={f._id} className="chatSuggestionsItem"
                                                onClick={() => startNewConversation(f._id)}>
                                                <span className="likesListItemLeft">
                                                    <img src={f.profilePicture} alt="profilepic" className="likesPic" />
                                                    <span className="likeName">{f.userName}</span>
                                                </span>
                                            </li>
                                        })
                                    }
                                </ul>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <div className="messenger">
                        <div className="messengerLeft">
                            <div className="messengerLeftWrapper">
                                <div className="messengerLeftWrapperTop">
                                    <div className="directDiv">
                                        <span className="directDivText">Direct</span>
                                        <Button onClick={handleShowFollowingShow} className="postButton">New chat</Button>
                                    </div>
                                </div>
                                <div className="messengerLeftWrapperBottom">
                                    {
                                        conversations?.length !== 0 ? conversations?.map(c => {
                                            return <div onClick={() => setCurrentChat(c)}
                                                key={c._id}>
                                                <Conversation conversation={c} user={user} />
                                            </div>
                                        }

                                        ) : <Alert className="followedAlert">
                                            No chats yet! start a new chat...
                                        </Alert>
                                    }
                                </div>

                            </div>

                        </div>
                        <div className="messengerRight">
                            {
                                currentChat ?

                                    <div className="messengerRightWrapper">
                                        <div className="messengerRightWrapperTop">

                                            {
                                                messages?.length !== 0 ? messages?.map(m => <div key={m._id} ref={scrollRef}>
                                                    <Message msg={m}
                                                        own={m?.sender?._id === user?._id}
                                                    />
                                                </div>
                                                ) : <Alert className="followedAlert">
                                                    Its a new chat! say hi to your friend...
                                                </Alert>
                                            }
                                        </div>
                                        <div className="messengerRightWrapperBottom">
                                            <textarea className="chatMessageInput" placeholder="type your message..."
                                                value={message}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSubmit();
                                                    }
                                                }}
                                                onChange={(e) => setMessage(e.target.value)}></textarea>
                                            <Button onClick={handleSubmit} className="postButton">Send</Button>
                                        </div>
                                    </div> : <span className="noConversationText">
                                        Open a chat to start chatting.
                                        <p>
                                            (chats made real-time using socket.io)
                                        </p>
                                        <p>
                                            login creds for testing chat(use different browser):
                                        </p>
                                        <p>
                                            email: first@user.com
                                        </p>
                                        <p>
                                            password: first123
                                        </p>
                                    </span>
                            }
                        </div>
                    </div>
                </Container>
        }
    </>
}