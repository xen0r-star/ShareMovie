import { ApplicationCommandType } from "discord.js";

/**
 * @type {import("../../../index").Scommand}
 */
export default {
  name: "create_session",
  description: "Creating a Session for the Server",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Sahre",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    await client.sendEmbed(interaction, `Creating a Session 🔄️`);
  },
};
