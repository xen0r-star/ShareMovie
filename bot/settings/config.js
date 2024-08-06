import { Colors } from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

const settings = {
  TOKEN: process.env.TOKEN,
  PREFIX: process.env.PREFIX || "!SM",
  Owners: ["897515250037964880", "899685948760150056"],
  Slash: {
    Global: false,
    GuildID: process.env.GuildID,
  },
  embed: {
    color: Colors.LightGrey,
    wrongColor: Colors.Red,
  },
  emoji: {
    success: "✅",
    error: "❌",
  },
  message: {
    permissionsBot: "I am missing the following permissions",
    permissionsUser: "You are missing the following permissions"
  },
  activity: {
    message: "0 movies in progress"
  }
};

export default settings;
