/** @format */

const {
	addMessage,
	getAllMessage,
} = require("../controllers/messagesController");
const {
	getGroupChatName,
	createGroupChat,
	addToGroup,
	fetchChats,
	addMessageGroup,
	allchats,
	getAllGroupMessage,
} = require("../controllers/groupchatController");

const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getAllMessage);

//router.get("/getgroupchatname/", getGroupChatName);

//
router.post("/getgroupmessages", allchats);

//**group chat */
router.post("/creategroup/", createGroupChat);
router.put("/addtogroup", addToGroup);

router.post("/sendmessageGroup", addMessageGroup);
//
// router.get("/getallgroupmessages", fetchChats);

router.post("/groupchatmessage", allchats);

//1-adding api - based on current user  -list of contacts and Groups

//2-add one api which fetch chats based on the contacts

module.exports = router;
