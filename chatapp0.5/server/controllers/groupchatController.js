/** @format */

const Messages = require("../models/messageModel");

const groupchat = require("../models/groupchatModel");
const { json } = require("express");
const { $where } = require("../models/messageModel");

// module.exports.getAllGroupMessage = async (req, res, next) => {
// 	try {
// 		const { from, to } = req.body;
// 		console.log(`req: ${JSON.stringify(req.body)}`);
// 		const messages = await groupchat
// 			.find({
// 				users: {
// 					$all: [from, to],
// 				},
// 			})
// 			.sort({ updatedAt: 1 });
// 		console.log("message :" + typeof messages);
// 		// for (let [key, value] of Object.entries(messages)) {
// 		// 	//console.log(`keys ${key}:${value}`);
// 		// 	console.log(`${value.message?.text}`);
// 		// }

// 		const projectMessages = messages.map((msg) => {
// 			//error occur here undefined

// 			console.log("checking msg:" + msg?.message?.text);

// 			return {
// 				fromSelf: msg.sender === from,
// 				message: msg?.message?.text,
// 			};
// 		});

// 		res.json(projectMessages);
// 	} catch (error) {
// 		next(error);
// 	}
// };

module.exports.createGroupChat = async (req, res) => {
	if (!req.body.members || !req.body.name) {
		return res.status(400).send({ message: "Please Fill all the feilds" });
	}

	var members = JSON.parse(req.body.members);

	if (members.length < 2) {
		return res
			.status(400)
			.send("More than 2 users are required to form a group chat");
	}
	//console.log("member :" + members);
	members.push(req.members);

	try {
		const groupChat = await groupchat.create({
			name: req.body.name,
			members: members,
		});

		const fullGroupChat = await groupchat
			.findOne({ _id: groupChat._id })
			.populate("members");

		res.status(200).json(fullGroupChat);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
};

//add to group
module.exports.addToGroup = async (req, res) => {
	const { chatId, userId } = req.body;

	// check if the requester is admin

	const added = await groupchat
		.findByIdAndUpdate(
			chatId,
			{
				$push: { members: userId },
			},
			{
				new: true,
			}
		)
		.populate("members", "-password");
	if (!added) {
		res.status(404);
		throw new Error("Chat Not Found");
	} else {
		res.json(added);
	}
};

// module.exports.allchats = async (req, res, next) => {
// 	try {
// 		// id
// 		const { id, from, to } = req.body;
// 		const messages = await groupchat
// 			.find({
// 				users: {
// 					$all: [from, to],
// 				},
// 			})
// 			.sort({ updatedAt: 1 });
// 		//accessing messages

// 		const projectMessages = messages.map((msg) => {
// 			return {
// 				fromSelf: msg.sender?.toString() === from,
// 				message: msg.messages?.text,
// 			};
// 		});
// 		//console.log(`project messages : ${JSON.stringify(projectMessages)}`);
// 		res.json(projectMessages);
// 	} catch (error) {
// 		next(error);
// 	}
// };

//change this to fetch all the chats
// module.exports.fetchChats = async (req, res, next) => {
// 	try {
// 		const id = req.body._id;
// 		await groupchat
// 			.find({ members: { $elemMatch: { $eq: req._id } } })
// 			.populate("members", "messages")

// 			// .populate("message")
// 			.sort({ updatedAt: -1 })
// 			.then(async (results) => {
// 				results = await groupchat.populate(results, {
// 					path: "message.sender",
// 					select: "name pic email",
// 				});
// 				// console.log(results);
// 				res.status(200).send(results);
// 			});
// 	} catch (error) {
// 		res.status(400);
// 		throw new Error(error.message);
// 	}
// };

// module.exports.addMessageGroup = async (req, res, next) => {
// 	try {
// 		const { from, to, message } = req.body;
// 		const data = await groupchat.create({
// 			messages: {
// 				message: message,
// 			},
// 			users: [from, to],
// 			sender: from,
// 		});
// 		console.log(data);
// 		if (data)
// 			return res.json({
// 				msg: "Message added successfully!",
// 			});
// 		return res.json({
// 			msg: "Failed to add message to DB",
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };

//working -tested
//addmessage
module.exports.addMessageGroup = async (req, res, next) => {
	const { name, from, messages } = req.body;
	const data = await groupchat.findOne({ name });
	//console.log(`data : ${JSON.stringify(data)}`);
	if (!data) {
		res.status(404).send(" name is not found in db");
		//console.log("data");
	}

	data.messages.push({ sender: from, message: messages });
	await data.save();
	return res.status(200).send(data);
};

//new based on the user input it fetch the chats
module.exports.fetchChats = async (req, res, next) => {
	try {
		const users = await groupchat
			.find({
				$and: [{ members: { $elemMatch: { $eq: req.params.id } } }],
			})
			.select(["name", "members", "messages"]);

		// function check(users, id) {
		// 	users.map((user, index) => {
		// 		console.log(JSON.stringify(user.members[index]));
		// 	});
		// }
		// check(users, id);

		console.log(users);
		return res.json(users);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
};

//fectching chats by the group name
module.exports.allchats = async (req, res) => {
	const { name, from, to } = req.body;
	try {
		const groupchats = await groupchat.find({
			name,
		});

		if (!groupchats) {
			res.status(404).send(`group name with ${name} messages not found`);
		}
		// console.log(typeof groupchats);
		// console.log(Object.values(groupchats));
		let pm;

		Object.values(groupchats).map((message) => {
			// console.log(`message : ${message.messages}`);
			//console.log(JSON.stringify(message.messages));
			pm = message.messages;
		});
		const projectMessages = pm?.map((msg) => {
			// console.log(msg.message);
			return {
				fromSelf: msg.sender.toString() === from,
				message: msg.message,
				sender: msg.sender,
			};
		});
		// console.log(projectMessages);
		// console.log(groupchats);
		// groupchats.map((message) => {
		// 	console.log(message.messages);
		// });
		// const projectMessages = groupchats.messages;
		// console.log(projectMessages);
		// projectMessages?.map((message) => {
		// 	return {
		// 		fromSelf: message.members?.toString() === from,
		// 		message: message.message,
		// 	};
		// });
		// console.log(projectMessages);
		// console.log(JSON.stringify(groupchats.messages));
		// const pm = groupchats.messages;
		// pm.map((message) => {
		// 	console.log(message.message);
		// });
		return res.status(200).json(projectMessages);
	} catch (err) {
		console.log(err);
	}
};
