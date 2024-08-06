import { ActivityType } from "discord.js";
import { client } from "../bot.js";
import settings from "../settings/config.js";

/**
 * Event listener for when the client becomes ready.
 * @event client#ready
 */
client.on("ready", async () => {
  try {
    console.log(`> ✅ ${client.user.tag} is now online`);

    client.user.setActivity({
      name: settings.activity.message,
      type: ActivityType.Custom,
    });
  } catch (error) {
    console.error("An error occurred in the ready event:", error);
  }
});

/**
 * Sets the bot's presence and activity when it becomes ready.
 * @module ReadyEvent
 */
