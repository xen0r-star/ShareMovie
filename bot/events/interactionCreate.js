import { InteractionType } from "discord.js";
import { client } from "../bot.js";
import settings from "../settings/config.js";

/**
 * Handles interaction events, such as slash commands.
 * @param {Interaction} interaction
 */
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.user.bot || !interaction.guild) return;

    if (interaction.type == InteractionType.ApplicationCommand) {
      const command = client.scommands.get(interaction.commandName);

      if (!command) {
        return client.send(interaction, {
          content: `\`${interaction.commandName}\` is not a valid command !!`,
          ephemeral: true,
        });
      }

      const { member, guild } = interaction;
      const { userPermissions, botPermissions } = command;

      const missingUserPerms = userPermissions.filter(
        (perm) => !member.permissions.has(perm)
      );
      if (missingUserPerms.length > 0) {
        await client.sendEmbed(
          interaction,
          `${settings.message.permissionsUser}: \`${missingUserPerms.join(
            ", "
          )}\``
        );
        return;
      }

      const missingBotPerms = botPermissions.filter(
        (perm) => !guild.members.me.permissions.has(perm)
      );
      if (missingBotPerms.length > 0) {
        await client.sendEmbed(
          interaction,
          `${settings.message.permissionsBot}: \`${missingBotPerms.join(
            ", "
          )}\``
        );
        return;
      }

      await command.run({ client, interaction });
    }
  } catch (error) {
    console.error("An error occurred in interactionCreate event:", error);

    await client.sendEmbed(
      interaction,
      "An error occurred while processing your command. Please try again later.",
      settings.embed.warning
    );
  }
});
