/** @format */

import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host, allChats } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";

import { io } from "socket.io-client";

export default function Chats() {
	const socket = useRef();
	const navigate = useNavigate();
	const [contacts, setContacts] = useState([]);
	const [currentUser, setCurrentUser] = useState(undefined);
	const [currentChat, setCurrentChat] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [groupChatName, setGroupChatName] = useState(undefined);

	useEffect(() => {
		const navigationTo = async () => {
			if (!localStorage.getItem("chat-app-user")) {
				navigate("/login");
			} else {
				setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
				setIsLoaded(true);
			}
		};
		navigationTo();
	}, []);

	useEffect(() => {
		if ((currentUser, currentChat)) {
			socket.current = io(host);
			socket.current.emit("add-user", currentUser._id);
			socket.current.emit("join", currentChat._id);
		}
	}, [currentUser, currentChat]);
	//socket check
	// console.log(`check socket :${Object.values(socket)}`);

	useEffect(() => {
		const getCurrentUser = async () => {
			if (currentUser) {
				if (currentUser.isAvatarImageSet) {
					const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
					setContacts(data.data);
				} else {
					navigate("/setAvatar");
				}
			}
		};
		getCurrentUser();
	}, [currentUser]);

	// console.log(`current User :${JSON.stringify(currentUser?._id)}`);
	//getting all the group name
	useEffect(() => {
		const fetchChats = async () => {
			if (currentUser) {
				if (currentUser._id) {
					const data = await axios.get(`${allChats}/${currentUser._id}`);
					setGroupChatName(data.data);
				}
			}
		};
		fetchChats();
	}, [currentUser]);

	const handleChatChange = (chat) => {
		setCurrentChat(chat);
	};
	console.log("chats current chat :" + currentChat);
	return (
		<Container>
			<div className="container">
				<Contacts
					contacts={contacts}
					currentUser={currentUser}
					changeChat={handleChatChange}
					groupChatName={groupChatName}
				/>

				{isLoaded && currentChat === false ? (
					<Welcome currentUser={currentUser} />
				) : (
					<ChatContainer
						contacts={contacts}
						currentChat={currentChat}
						socket={socket}
						currentUser={currentUser}
						groupChatName={groupChatName}
					/>
				)}
				{/* {
					<GroupchatContainer
						currentChat={currentChat}
						currentUser={currentUser}
					/>
				} */}
			</div>
		</Container>
	);
}

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 1rem;
	align-items: center;
	background-color: #131324;
	.container {
		height: 85vh;
		width: 85vw;
		background-color: #00000076;
		display: grid;
		grid-template-columns: 25% 75%;
		@media screen and (min-width: 720px) and (max-width: 1080px) {
			grid-template-columns: 35% 65%;
		}
	}
`;
