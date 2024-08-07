import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../settings/firebaseConfig.js'

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "create_session",
    description: "Creating a Session for the Server",
    userPermissions: ["SendMessages"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "Share",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        let steps = [
            "🔄️ server registration...",
            "🔄️ Creating a Session...",
            "🔄️ creating an administrator code..."
        ];

        function formatSteps(steps) {
            return steps.join('\n');
        }

        async function embedsEdit(color = Colors.LightGreys) {
            await message.edit({embeds: [new EmbedBuilder()
                .setDescription(formatSteps(steps))
                .setTitle(`server session configuration ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({ size: 2048, format: 'png' }))
                .setFooter({ text: client.user.tag })
                .setTimestamp()
                .setColor(color)]});
        }

        const message = await interaction.reply({ embeds: 
            [new EmbedBuilder()
                .setDescription(formatSteps(steps))
                .setTitle(`server session configuration ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({ size: 2048, format: 'png' }))
                .setFooter({ text: client.user.tag })
                .setTimestamp()
                .setColor(Colors.LightGrey)
            ],
            fetchReply: true
        });



        let serverExists = 0;
        let serverExistsData = null;
        const snapshotServer = await db.collection('Server').get();
        snapshotServer.forEach((doc) => {
            if (doc.id == interaction.guild.id.toString()) {
                serverExists += 1;
                serverExistsData = doc.data();
            }
        });

        let uuid = "";
        if (serverExists >= 1) {
            uuid = serverExistsData.id_session;

            steps[0] = "✅ Server already registered";
            embedsEdit(Colors.LightGrey);
        } else {
            uuid = uuidv4();

            const documentRef = db.collection('Server').doc(interaction.guild.id.toString());
            await documentRef.set({
                'hosting': false,
                'id_session': uuid
            });

            steps[0] = "✅ Server register";
            embedsEdit(Colors.LightGrey);
        }



        let sessionExists = 0;
        let sessionExistsData = null;
        const snapshotSession = await db.collection('Session').get();
        snapshotSession.forEach((doc) => {
            if (doc.id == uuid) {
                sessionExists += 1;
                sessionExistsData = doc.data();
            }
        });
        
        let adminCode = uuidv4().replace(/-/g, '').substring(0, 8);
        if (sessionExists >= 1) {
            if (!sessionExistsData.adminCode || sessionExistsData.adminCode.trim() === "") {
                const documentRef = db.collection('Session').doc(uuid);
                await documentRef.update({'adminCode': adminCode});
            } else {
                adminCode = sessionExistsData.adminCode
            }

            steps[1] = "✅ Session already created";
            embedsEdit(Colors.LightGrey);
        } else {
            const documentRef = db.collection('Session').doc(uuid);
            await documentRef.set({
                'server': interaction.guild.id.toString(),
                'adminCode': adminCode
            });

            steps[1] = "✅ Session Created";
            embedsEdit(Colors.LightGrey);
        }
        


        try {
            await interaction.user.send({ embeds: [new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`The Admin Code for ${interaction.guild.name}`)
                .setDescription(`Here is the admin code for ${interaction.guild.name}:\n\`\`\`password\n${adminCode}\n\`\`\``)
                .setThumbnail(interaction.guild.iconURL({ size: 2048, format: 'png' }))
                .setFooter({ text: 'This is an administrator password do not give it to anyone !' })
                .setTimestamp()] 
            });

            steps[2] = "✅ Administrator code send as DM";
            embedsEdit(Colors.DarkGreen);
        } catch (error) {
            steps[2] = "❌ Unable to send you DM";
            embedsEdit(Colors.DarkGreen);
        }
    },
};

