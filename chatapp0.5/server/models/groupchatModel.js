/** @format */

const mongoose = require("mongoose");

const groupChatSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
		},
	],
	messages: [
		{
			sender: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Users",
			},
			message: {
				type: String,
				// required: true,
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

module.exports = mongoose.model("groupChat", groupChatSchema);
