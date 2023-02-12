/** @format */

export const host = "http://localhost:8800";
export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const setAvatarRoute = `${host}/api/auth/setAvatar`;
export const allUsersRoute = `${host}/api/auth/allUsers`;
export const logoutRoute = `${host}/api/auth/logout`;
export const sendMessageRoute = `${host}/api/message/addmsg`;
export const getAllMessagesRoute = `${host}/api/message/getmsg`;
//searching the user
export const searchUser = `${host}/api/auth/searchuser`;

//to get the group chatnames
export const getAllChatNames = `${host}/api/auth/allgroupchatnames`;
export const createGroup = `${host}/api/message/creategroup/`;
export const addToGroup = `${host}/api/message/addtogroup`;
//
export const allChats = `${host}/api/auth/allchats`;
//send message from group

export const sendMessageGroup = `${host}/api/message/sendmessageGroup`;

//fetching chat with group name
export const groupchatmessage = `${host}/api/message/getgroupmessages`;
