import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../settings/firebaseConfig.js'
import settings from "../../../settings/config.js"

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "admin_config_code",
    description: "Generate or retrieve the administrator code required to configure the sharing parameters",
    userPermissions: ["SendMessages", "ManageEvents"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "Share",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        
    },
};

