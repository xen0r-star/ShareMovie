import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import settings from "../../../settings/config.js"

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "generate_code",
    description: "Generate a code to share the movie",
    userPermissions: ["SendMessages", "ManageEvents"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "Share",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle('Configuring movie sharing')
                .setDescription('Configure the event and share message')
                .setColor(settings.embed.color)
                .setFooter({ text: "Choose a configuration option below:", iconURL: client.user.iconURL })
                .setTimestamp()
            ],
            components: [new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Select an option')
                        .addOptions([
                            {
                                label: 'Event',
                                description: 'Enable or disable event creation',
                                value: 'event_settings',
                            },
                            {
                                label: 'Preview message',
                                description: 'Preview of connection message',
                                value: 'preview_settings',
                            },
                            {
                                label: 'Channel',
                                description: 'Channel in which it will be send the message of connections',
                                value: 'channel_settings',
                            }
                        ])
                ),
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setDisabled(true)
                            .setCustomId('validate')
                            .setLabel('Validate')
                            .setStyle(ButtonStyle.Success)
                    )
            ],
            fetchReply: true,
        });



        client.on('interactionCreate', async (interaction) => {
            if (interaction.isSelectMenu()) {
                if (interaction.customId === 'select') {
                    const selectedValue = interaction.values[0];
                    if (selectedValue === 'event_settings') {
                        // Créer un embed pour la confirmation
                        const confirmEmbed = new EmbedBuilder()
                            .setTitle('Configurer les événements')
                            .setDescription('Voulez-vous configurer les événements?')
                            .setColor(settings.embed.color);
        
                        // Créer les boutons Oui et Non
                        const buttons = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('yes')
                                    .setLabel('Oui')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('no')
                                    .setLabel('Non')
                                    .setStyle(ButtonStyle.Danger)
                            );
        
                        // Répondre avec le nouvel embed et les boutons
                        await interaction.update({
                            embeds: [confirmEmbed],
                            components: [buttons]
                        });
                    } else if (selectedValue === 'preview_settings') {
                        await interaction.reply({ 
                            embeds: [new EmbedBuilder()
                                .setDescription("Watch the film live with all the members of the server and chat at the same time.")
                                .setTitle(`Entry code for ${interaction.guild.name} movie`)
                                .setThumbnail(interaction.guild.iconURL({ size: 2048, format: 'png' }))
                                .setFooter({ text: client.user.tag })
                                .addFields({ name: '**Login Code**', value: 'XXXX-XXXX' })
                                .setTimestamp()
                                .setColor(settings.embed.color)
                            ],
                            components: [new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('Login page')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL("https://share-movie.web.app/"),
                                    new ButtonBuilder()
                                        .setLabel('Event link')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL("https://share-movie.web.app/"),
                                )
                            ],
                            ephemeral: true,
                            fetchReply: true
                        });
                    }
                }
            } else if (interaction.isButton()) {
                if (interaction.customId === 'yes' || interaction.customId === 'no') {
                    // Revenir au menu de sélection initial
                    const embed = new EmbedBuilder()
                        .setTitle('Configuration Menu')
                        .setDescription('Choisissez une option de configuration ci-dessous:')
                        .setColor(settings.embed.color);
        
                    const selectMenu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('select')
                                .setPlaceholder('Select an option')
                                .addOptions([
                                    {
                                        label: 'Événement',
                                        description: 'Configurer les paramètres des événements',
                                        value: 'event_settings',
                                    },
                                ])
                        );
        
                    // Répondre avec l'embed et le menu déroulant initial
                    await interaction.update({
                        embeds: [embed],
                        components: [selectMenu]
                    });
                }
            }
        });
    },
};

