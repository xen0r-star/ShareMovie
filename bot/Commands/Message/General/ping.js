import { EmbedBuilder } from "discord.js";
import settings from "../../../settings/config.js"

/**
 * @type {import("../../../index.js").Mcommand}
 */
export default {
  name: "ping",
  description: "Check the bot's latency.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "General",
  cooldown: 5,

  run: async ({ client, message, args, prefix }) => {
    await message.reply({ 
            embeds: [new EmbedBuilder()
                .setTitle("🏓 Pong!")
                .addFields(
                    {name: "Bot Latency", value: `${message.createdTimestamp - message.createdTimestamp}ms`, inline: true},
                    {name: "API Latency", value: `${Math.round(client.ws.ping)}ms`, inline: true}
                )
                .setTimestamp()
                .setFooter({ text: clientclient.user.tag, iconURL: client.user.iconURL })
                .setColor(settings.embed.color)
            ]
        });
  },
};
