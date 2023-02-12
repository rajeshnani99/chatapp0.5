/** @format */

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import {
	getAllMessagesRoute,
	sendMessageRoute,
	allChats,
	sendMessageGroup,
	groupchatmessage,
} from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({
	currentChat,
	currentUser,
	socket,
	groupChatName,
	contacts,
}) {
	const [messages, setMessages] = useState([]);
	const [arrivalMessage, setArrivalMessage] = useState(null);
	const [arrivalGroupMessage, setArrivalGroupMessage] = useState([]);
	const [groupMessages, setGroupMessages] = useState([]);

	// console.log(`arrival message : ${JSON.stringify(arrivalMessage)}`);
	// console.log(`messages : ${messages}`);
	// console.log(`groupmessages : ${groupmessages}`);

	const scrollRef = useRef();

	useEffect(() => {
		const fetchData = async () => {
			if (currentChat) {
				const response = await axios.post(getAllMessagesRoute, {
					from: currentUser._id,
					to: currentChat._id,
				});
				setMessages(response.data);
				console.log(response);
				//fetching single person chat Messages from db
				console.log("chat message :" + JSON.stringify(response.data));
			}
		};
		fetchData();
	}, [currentChat]);
	console.log(`single chat data : ${JSON.stringify(messages)}`);

	useEffect(() => {
		const fetchGroup = async () => {
			if (currentChat) {
				const response = await axios.post(groupchatmessage, {
					name: currentChat.name,
					from: currentUser._id,
					to: currentChat.name,
				});
				setGroupMessages(response.data);
			}
		};
		fetchGroup();
	}, [currentChat]);

	const handleSendMsg = async (msg) => {
		await axios.post(sendMessageRoute, {
			from: currentUser._id,
			to: currentChat._id,
			message: msg,
		});
		socket.current.emit("send-msg", {
			to: currentChat._id,
			from: currentUser._id,
			message: msg,
		});
		const msgs = [...messages];
		// console.log(`messages :${JSON.stringify(msgs)}`);
		msgs.push({
			fromSelf: true,
			message: msg,
		});
		setMessages(msgs);
		// post message to db and emitting server
		//console.log("sent Message :" + JSON.stringify(msgs));
	};

	console.log(`arrival mesg : ` + JSON.stringify(arrivalGroupMessage));

	const handleGroupMsg = async (msg) => {
		await axios.post(sendMessageGroup, {
			name: currentChat.name,
			from: currentUser._id,
			messages: msg,
		});
		//

		socket.current.emit("message", {
			to: currentChat._id,
			from: currentUser._id,
			message: msg,
		});

		//
		const msgs = [...messages];
		console.log(`messages :${JSON.stringify(msgs)}`);
		msgs.push({
			fromSelf: true,
			message: msg,
		});
		setGroupMessages(msgs);
	};

	//Joinig room and emitting messages

	useEffect(() => {
		if (socket.current) {
			socket.current.on("message-received", (msg) => {
				setArrivalGroupMessage({
					fromSelf: false,
					message: msg,
				});
			});
		}
	}, [arrivalGroupMessage]);

	useEffect(() => {
		if (socket.current) {
			socket.current.on("msg-recieved", (msg) => {
				setArrivalMessage({
					fromSelf: false,
					message: msg,
				});
			});
		}
	}, [arrivalMessage]);

	console.log(`single arrival messages : ${arrivalMessage}`);

	useEffect(() => {
		arrivalGroupMessage &&
			setGroupMessages((prev) => [...prev, arrivalGroupMessage]);
	}, [arrivalGroupMessage]);

	useEffect(() => {
		arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
	}, [arrivalMessage]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, groupMessages]);

	//solved
	let chats;
	const contactsarr = Object.values(contacts);
	contactsarr.map((user) => {
		if (currentChat._id === user._id) {
			chats = true;
		}
	});

	return (
		<>
			{chats
				? currentChat && (
						<Container>
							<div className="chat-header">
								<div className="user-details">
									<div className="avatar">
										<img
											src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
											alt="avatar"
										/>
									</div>
									<div className="username">
										<h3>{currentChat.username}</h3>
									</div>
								</div>
								<Logout />
							</div>
							<div className="chat-messages">
								{messages?.map((message) => {
									return (
										<div ref={scrollRef} key={uuidv4()}>
											<div
												className={`message ${
													message.fromSelf ? "sended" : "recieved"
												}`}>
												<div className="content ">
													<p>{message.message}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
							<ChatInput handleSendMsg={handleSendMsg} chats={chats} />
						</Container>
				  )
				: groupChatName && (
						<Container>
							<div className="chat-header">
								<div className="user-details">
									<div className="avatar">
										<img
											src="data:image/jpeg;base64,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"
											alt="avatar"
										/>
									</div>
									<div className="username">
										<h3>{currentChat.name}</h3>
									</div>
								</div>
								<Logout />
							</div>
							<div className="chat-messages">
								{Object.values(groupMessages)?.map((message) => {
									return (
										<div ref={scrollRef} key={uuidv4()}>
											<div
												className={`message ${
													message.fromSelf ? "sended" : "recieved"
												}`}>
												<div className="content ">
													<p>{message.message}</p>
													{contacts.map((user, index) => {
														if (user._id === message.sender) {
															return (
																<li style={{ color: "#808080" }} key={index}>
																	sent by:-{user.username}
																</li>
															);
														}
													})}
												</div>
											</div>
										</div>
									);
								})}
							</div>
							<ChatInput handleGroupMsg={handleGroupMsg} chats={chats} />
						</Container>
				  )}
		</>
	);
}

const Container = styled.div`
	display: grid;
	grid-template-rows: 10% 80% 10%;
	gap: 0.1rem;
	overflow: hidden;
	@media screen and (min-width: 720px) and (max-width: 1080px) {
		grid-template-rows: 15% 70% 15%;
	}
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2rem;
		.user-details {
			display: flex;
			align-items: center;
			gap: 1rem;
			.avatar {
				img {
					height: 3rem;
				}
			}
			.username {
				h3 {
					color: white;
					text-transform: capitalize;
				}
			}
		}
	}
	.chat-messages {
		padding: 1rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow: auto;
		&::-webkit-scrollbar {
			width: 0.2rem;
			&-thumb {
				background-color: #ffffff39;
				width: 0.1rem;
				border-radius: 1rem;
			}
		}
		.message {
			display: flex;
			align-items: center;
			.content {
				max-width: 40%;
				overflow-wrap: break-word;
				padding: 1rem;
				font-size: 1.1rem;
				border-radius: 1rem;
				color: #d1d1d1;
				@media screen and (min-width: 720px) and (max-width: 1080px) {
					max-width: 70%;
				}
			}
		}
		.sended {
			justify-content: flex-end;
			.content {
				background-color: #4f04ff21;
			}
		}
		.recieved {
			justify-content: flex-start;
			.content {
				background-color: #9900ff20;
			}
		}
	}
`;
