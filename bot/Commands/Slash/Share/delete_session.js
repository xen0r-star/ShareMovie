import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";

import { db } from '../../../settings/firebaseConfig.js'
import settings from "../../../settings/config.js"

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "delete_session",
    description: "Delete the existing share session on the server",
    userPermissions: ["SendMessages", "ManageEvents"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "Share",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        let serverExists = 0;
        const snapshotServer = await db.collection('Server').get();
        snapshotServer.forEach(async (doc) => {
            if (doc.id === interaction.guild.id.toString()) {
                serverExists += 1;
                if (doc.data().hosting === false) {
                    await db.collection('Session').doc(doc.data().id_session).delete();

                    const serverDocRef = db.collection('Server').doc(interaction.guild.id.toString());
                    await serverDocRef.update({
                        id_session: '',
                    });

                    interaction.reply('delete session');
                } else {
                    interaction.reply('delete session no because hosting true');
                }
            }
        });

        if (serverExists == 0) {
            interaction.reply('no session existing');
        }
    },
};

