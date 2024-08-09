import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import settings from "../../../settings/config.js"

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "ping",
    description: "Check the bot's latency.",
    userPermissions: ["SendMessages"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "General",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        await interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setTitle("🏓 Pong!")
                .addFields(
                    {name: "Bot Latency", value: `${interaction.createdTimestamp - interaction.createdTimestamp}ms`, inline: true},
                    {name: "API Latency", value: `${Math.round(client.ws.ping)}ms`, inline: true}
                )
                .setTimestamp()
                .setFooter({ text: client.user.tag, iconURL: client.user.iconURL })
                .setColor(settings.embed.color)
            ]
        });
    },
};
