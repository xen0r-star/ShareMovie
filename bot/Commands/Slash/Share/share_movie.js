import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import moment from 'moment';

import settings from "../../../settings/config.js"
import { db } from '../../../settings/firebaseConfig.js'

/**
 * @type {import("../../../index").Scommand}
 */
export default {
    name: "share_movie",
    description: "Generate a code to share the movie",
    userPermissions: ["SendMessages", "ManageEvents"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    category: "Share",
    type: ApplicationCommandType.ChatInput,

    run: async ({ client, interaction }) => {
        let Exists = 0;
        let ExistsData = null;
        const snapshot = await db.collection('Server').get();
        snapshot.forEach((doc) => {
            if (doc.id == interaction.guild.id.toString()) {
                ExistsData = doc.data();
                if (ExistsData.id_session && ExistsData.id_session.trim() !== "") {
                    Exists += 1;
                    return;
                }
            }
        });

        if (Exists >= 1) {
            const dataFields = ["No", "undefined", "undefined", "No", "undefined"];
            let timeScheduledEvent = [];
            let channelScheduledEvent = undefined;
        
            const homeComponentsMenu = new ActionRowBuilder()
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
                                label: 'Channel',
                                description: 'Channel in which it will be send the message of connections',
                                value: 'channel_settings',
                            },
                            {
                                label: 'Mention',
                                description: 'Mention a role when sharing is created',
                                value: 'mention_settings'
                            },
                            {
                                label: 'Preview message',
                                description: 'Preview of connection message',
                                value: 'preview_settings',
                            },
                            {
                                label: 'Exit',
                                description: 'Exit the configurator',
                                value: 'exit_settings',
                            }
                        ])
                );

            const homeComponentsButtonFalse = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setDisabled(false)
                        .setCustomId('validate')
                        .setLabel('Validate')
                        .setStyle(ButtonStyle.Success)
                );

            const homeComponentsButtonTrue = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setDisabled(true)
                        .setCustomId('validate')
                        .setLabel('Validate')
                        .setStyle(ButtonStyle.Success)
                );
            

            const homeEmbed = await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('Configuring movie sharing')
                    .setDescription('Configure the event and share message')
                    .setColor(settings.embed.color)
                    .addFields(
                        { name: 'Event', value: dataFields[0], inline: true}, 
                        { name: 'Start', value: dataFields[1], inline: true},
                        { name: 'Last', value: dataFields[2], inline: true},
                        { name: 'Mention', value: dataFields[3], inline: true},
                        { name: 'Channel', value: dataFields[4], inline: true},
                        { name: '\u200B', value: '\u200B', inline: true }
                    )
                    .setFooter({ text: "Choose a configuration option below:", iconURL: client.user.iconURL })
                    .setTimestamp()
                ],
                components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse],
                fetchReply: true,
            });



            client.on('interactionCreate', async (interaction) => {
                if (interaction.isStringSelectMenu()) {
                    if (interaction.customId === 'select') {
                        const selectedValue = interaction.values[0];
                        if (selectedValue === 'event_settings') {
                            await interaction.update({
                                embeds: [new EmbedBuilder()
                                    .setTitle('Configuring events')
                                    .setDescription('Do you want to activate the creation of an event ?')
                                    .setColor(settings.embed.color)],
                                components: [new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('yes')
                                            .setLabel('Yes')
                                            .setStyle(ButtonStyle.Success),
                                        new ButtonBuilder()
                                            .setCustomId('no')
                                            .setLabel('No')
                                            .setStyle(ButtonStyle.Danger)
                                    )]
                            });
                        } else if (selectedValue === 'preview_settings') {
                            let messageMention = dataFields[3] !== 'No' ? `${dataFields[3]}` : ''
                            await interaction.reply({ 
                                content: messageMention,
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
                                            .setURL("https://discord.gg/"),
                                    )
                                ],
                                ephemeral: true
                            });
                        } else if (selectedValue === 'channel_settings') {
                            await interaction.update({
                                embeds: [new EmbedBuilder()
                                    .setTitle('Which channel should the share message be sent to ?')
                                    .setDescription('Reply with `cancel` to cancel the order')
                                    .setColor(settings.embed.color)],
                                components: []
                            });


                            const filter = (m) => m.author.id === interaction.user.id;
                            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

                            collector.on('collect', async (m) => {
                                try {
                                    await m.delete();
                                } catch (error) {
                                    console.error('Failed to delete message:', error);
                                }

                                if (m.content.toLowerCase() === 'cancel') {
                                    const embed = homeEmbed.embeds[0];
                                    const embedBuilder = EmbedBuilder.from(embed);
                                    embedBuilder.spliceFields(0, 5, 
                                        { name: 'Event', value: dataFields[0], inline: true}, 
                                        { name: 'Start', value: dataFields[1], inline: true},
                                        { name: 'Last', value: dataFields[2], inline: true},
                                        { name: 'Mention', value: dataFields[3], inline: true},
                                        { name: 'Channel', value: dataFields[4], inline: true}
                                    );
                                    await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                                    collector.stop();
                                    return;
                                }

                                const channel = m.mentions.channels.first() || interaction.guild.channels.cache.get(m.content);
                                
                                if (!channel) {
                                    await interaction.followUp({ content: 'Please mention a valid channel or provide a valid channel ID.', ephemeral: true });
                                    return;
                                }
                                
                                const embed = homeEmbed.embeds[0];
                                const embedBuilder = EmbedBuilder.from(embed);
                                dataFields[4] = `<#${channel.id}>`;
                                channelScheduledEvent = channel.id;
                                embedBuilder.spliceFields(0, 5, 
                                    { name: 'Event', value: dataFields[0], inline: true}, 
                                    { name: 'Start', value: dataFields[1], inline: true},
                                    { name: 'Last', value: dataFields[2], inline: true},
                                    { name: 'Mention', value: dataFields[3], inline: true},
                                    { name: 'Channel', value: dataFields[4], inline: true}
                                );
                                await homeEmbed.edit({embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse]});
                                collector.stop();
                            });

                            collector.on('end', async (collected, reason) => {
                                if (reason === 'time') {
                                    const embed = homeEmbed.embeds[0];
                                    const embedBuilder = EmbedBuilder.from(embed);
                                    embedBuilder.spliceFields(0, 5, 
                                        { name: 'Event', value: dataFields[0], inline: true}, 
                                        { name: 'Start', value: dataFields[1], inline: true},
                                        { name: 'Last', value: dataFields[2], inline: true},
                                        { name: 'Mention', value: dataFields[3], inline: true},
                                        { name: 'Channel', value: dataFields[4], inline: true}
                                    );
                                    await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                                }
                            });
                        } else if (selectedValue === 'mention_settings') {
                            await interaction.update({
                                embeds: [new EmbedBuilder()
                                    .setTitle('What role should be mentioned when sharing the movie ?')
                                    .setDescription('Reply with `cancel` to cancel the order')
                                    .setColor(settings.embed.color)],
                                components: []
                            });


                            const filter = (m) => m.author.id === interaction.user.id;
                            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

                            collector.on('collect', async (m) => {
                                try {
                                    await m.delete();
                                } catch (error) {
                                    console.error('Failed to delete message:', error);
                                }

                                if (m.content.toLowerCase() === 'cancel') {
                                    const embed = homeEmbed.embeds[0];
                                    const embedBuilder = EmbedBuilder.from(embed);
                                    embedBuilder.spliceFields(0, 5, 
                                        { name: 'Event', value: dataFields[0], inline: true}, 
                                        { name: 'Start', value: dataFields[1], inline: true},
                                        { name: 'Last', value: dataFields[2], inline: true},
                                        { name: 'Mention', value: dataFields[3], inline: true},
                                        { name: 'Channel', value: dataFields[4], inline: true}
                                    );
                                    await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                                    collector.stop();
                                    return;
                                }

                                const role = m.mentions.roles.first() || interaction.guild.roles.cache.get(m.content);
                                
                                if (!role) {
                                    await interaction.followUp({ content: 'Please mention a valid role or provide a valid role ID.', ephemeral: true });
                                    return;
                                }
                                
                                const embed = homeEmbed.embeds[0];
                                const embedBuilder = EmbedBuilder.from(embed);
                                dataFields[3] = `<@&${role.id}>`;
                                embedBuilder.spliceFields(0, 5, 
                                    { name: 'Event', value: dataFields[0], inline: true}, 
                                    { name: 'Start', value: dataFields[1], inline: true},
                                    { name: 'Last', value: dataFields[2], inline: true},
                                    { name: 'Mention', value: dataFields[3], inline: true},
                                    { name: 'Channel', value: dataFields[4], inline: true}
                                );
                                await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                                collector.stop();
                            });

                            collector.on('end', async (collected, reason) => {
                                if (reason === 'time') {
                                    const embed = homeEmbed.embeds[0];
                                    const embedBuilder = EmbedBuilder.from(embed);
                                    embedBuilder.spliceFields(0, 5, 
                                        { name: 'Event', value: dataFields[0], inline: true}, 
                                        { name: 'Start', value: dataFields[1], inline: true},
                                        { name: 'Last', value: dataFields[2], inline: true},
                                        { name: 'Mention', value: dataFields[3], inline: true},
                                        { name: 'Channel', value: dataFields[4], inline: true}
                                    );
                                    await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                                }
                            });
                        } else if (selectedValue === 'exit_settings') {
                            await homeEmbed.delete();
                        }
                    } else if (interaction.customId === 'selectEventTimeStart') {
                        dataFields[1] = `\`In ${moment().subtract(interaction.values[0], 'seconds').fromNow(true)}\``;
                        timeScheduledEvent[0] = interaction.values[0];

                        await interaction.update({
                            embeds: [new EmbedBuilder()
                                .setTitle('Configuring events')
                                .setDescription('How long should the event last?')
                                .setColor(settings.embed.color)],
                            components: [new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('selectEventTimeEnd')
                                        .setPlaceholder('Select an option')
                                        .addOptions([
                                            {
                                                label: '5 minutes',
                                                description: 'Lasts for 5 minutes',
                                                value: '300',
                                            },
                                            {
                                                label: '15 minutes',
                                                description: 'Lasts for 15 minutes',
                                                value: '900',
                                            },
                                            {
                                                label: '30 minutes',
                                                description: 'Lasts for 30 minutes',
                                                value: '1800',
                                            },
                                            {
                                                label: '1 hour',
                                                description: 'Lasts for 1 hour',
                                                value: '3600',
                                            },
                                            
                                            {
                                                label: '2 hours',
                                                description: 'Lasts for 2 hours',
                                                value: '7200',
                                            },
                                            {
                                                label: '3 hours',
                                                description: 'Lasts for 3 hours',
                                                value: '10800',
                                            },
                                            {
                                                label: '4 hours',
                                                description: 'Lasts for 4 hours',
                                                value: '14400',
                                            },
                                            {
                                                label: '6 hours',
                                                description: 'Lasts for 6 hours',
                                                value: '21600',
                                            },
                                            {
                                                label: '12 hours',
                                                description: 'Lasts for 12 hours',
                                                value: '43200',
                                            },
                                            {
                                                label: '1 day',
                                                description: 'Lasts for 1 day',
                                                value: '86400',
                                            },
                                            {
                                                label: '2 days',
                                                description: 'Lasts for 2 days',
                                                value: '172800',
                                            },
                                            {
                                                label: '3 days',
                                                description: 'Lasts for 3 days',
                                                value: '259200',
                                            },
                                            {
                                                label: '1 week',
                                                description: 'Lasts for 1 week',
                                                value: '604800',
                                            },
                                            {
                                                label: '2 weeks',
                                                description: 'Lasts for 2 weeks',
                                                value: '1209600',
                                            },
                                            {
                                                label: '1 month',
                                                description: 'Lasts for 1 month',
                                                value: '2592000',
                                            }
                                        ])
                                )
                            ]
                        });
                    } else if (interaction.customId === 'selectEventTimeEnd') {
                        dataFields[2] = `\`${moment().subtract(interaction.values[0], 'seconds').fromNow(true)}\``;
                        timeScheduledEvent[1] = interaction.values[0];

                        const embed = homeEmbed.embeds[0];
                        const embedBuilder = EmbedBuilder.from(embed);
                        embedBuilder.spliceFields(0, 5, 
                            { name: 'Event', value: dataFields[0], inline: true}, 
                            { name: 'Start', value: dataFields[1], inline: true},
                            { name: 'Last', value: dataFields[2], inline: true},
                            { name: 'Mention', value: dataFields[3], inline: true},
                            { name: 'Channel', value: dataFields[4], inline: true}
                        );
                        await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                        await interaction.deferUpdate();
                    }
                } else if (interaction.isButton()) {
                    if (interaction.customId === 'yes') {
                        dataFields[0] = 'Yes';

                        await interaction.update({
                            embeds: [new EmbedBuilder()
                                .setTitle('Configuring events')
                                .setDescription('When do you want to set the start date for the event ?')
                                .setColor(settings.embed.color)],
                            components: [new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('selectEventTimeStart')
                                        .setPlaceholder('Select an option')
                                        .addOptions([
                                            {
                                                label: 'Now',
                                                description: 'Starts immediately',
                                                value: '0',
                                            },
                                            {
                                                label: 'In 5 minutes',
                                                description: 'Starts in 5 minutes',
                                                value: '300',
                                            },
                                            {
                                                label: 'In 15 minutes',
                                                description: 'Starts in 15 minutes',
                                                value: '900',
                                            },
                                            {
                                                label: 'In 30 minutes',
                                                description: 'Starts in 30 minutes',
                                                value: '1800',
                                            },
                                            {
                                                label: 'In 1 hour',
                                                description: 'Starts in 1 hour',
                                                value: '3600',
                                            },
                                            {
                                                label: 'In 2 hours',
                                                description: 'Starts in 2 hours',
                                                value: '7200',
                                            },
                                            {
                                                label: 'In 3 hours',
                                                description: 'Starts in 3 hours',
                                                value: '10800',
                                            },
                                            {
                                                label: 'In 4 hours',
                                                description: 'Starts in 4 hours',
                                                value: '14400',
                                            },
                                            {
                                                label: 'In 6 hours',
                                                description: 'Starts in 6 hours',
                                                value: '21600',
                                            },
                                            {
                                                label: 'In 12 hours',
                                                description: 'Starts in 12 hours',
                                                value: '43200',
                                            },
                                            {
                                                label: 'Tomorrow',
                                                description: 'Starts Tomorrow',
                                                value: '86400',
                                            },
                                            {
                                                label: 'In 2 days',
                                                description: 'Starts in 2 days',
                                                value: '172800',
                                            },
                                            {
                                                label: 'In 3 days',
                                                description: 'Starts in 3 days',
                                                value: '259200',
                                            },
                                            {
                                                label: 'In 1 week',
                                                description: 'Starts in 1 week',
                                                value: '604800',
                                            },
                                            {
                                                label: 'In 2 weeks',
                                                description: 'Starts in 2 weeks',
                                                value: '1209600',
                                            },
                                            {
                                                label: 'In 1 month',
                                                description: 'Starts in 1 month',
                                                value: '2592000',
                                            }
                                        ])
                                )
                            ]
                        });
                    } else if (interaction.customId === 'no') {
                        dataFields[0] = 'No';

                        const embed = homeEmbed.embeds[0];
                        const embedBuilder = EmbedBuilder.from(embed);
                        embedBuilder.spliceFields(0, 5, 
                            { name: 'Event', value: dataFields[0], inline: true}, 
                            { name: 'Start', value: dataFields[1], inline: true},
                            { name: 'Last', value: dataFields[2], inline: true},
                            { name: 'Mention', value: dataFields[3], inline: true},
                            { name: 'Channel', value: dataFields[4], inline: true}
                        );
                        await homeEmbed.edit({ embeds: [embedBuilder], components: [homeComponentsMenu, dataFields[4] === 'undefined' ? homeComponentsButtonTrue : homeComponentsButtonFalse] });
                    } else if (interaction.customId === 'validate') {
                        const modal = new ModalBuilder()
                            .setCustomId('configShareMovie')
                            .setTitle('Enter Administrator Code');
                
                        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                            .setCustomId('adminCode')
                            .setLabel("Please enter your administrator code below")
                            .setRequired(true)
                            .setPlaceholder("XXXXXXXX")
                            .setMinLength(8)
                            .setMaxLength(8)
                            .setStyle(TextInputStyle.Short)
                        ));
                        await interaction.showModal(modal);
                    }
                } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'configShareMovie') {
                    const adminCodeUser = interaction.fields.getTextInputValue('adminCode');
                    let admincodeServer = undefined;
            
                    const snapshot = await db.collection('Session').get();
                    snapshot.forEach((doc) => {
                        if (doc.id == ExistsData.id_session) {
                            admincodeServer = doc.data().adminCode;
                            return;
                        }
                    });

                    if (admincodeServer === adminCodeUser) {
                        await interaction.reply({ embeds: [new EmbedBuilder()
                            .setTitle('Administrator Code Verified')
                            .setDescription('The administrator code you entered is correct. Creating sharing...')
                            .setColor(settings.embed.correct)
                        ], ephemeral: true });

                        const codeShare = Array(2).fill().map(() => [...Array(4)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.random() * 36 | 0]).join('')).join('-')
                        let componentsEmbed = [];
                        if (dataFields[0] === 'Yes') {    
                            const scheduledEvent = await interaction.guild.scheduledEvents.create({
                                name: '🎬 Live Cinema Night!',
                                description: `### Join us for a fun watch party! 🎉\n\nJoin us on **${moment(new Date(Date.now() + timeScheduledEvent[0] * 1000)).format('MMMM D, YYYY [**at**] h:mm A')}** to watch a film together! Log on to [Share Movie](https://share-movie.web.app/) with the code **${codeShare}** and enjoy this unique moment with your friends and the whole server.\n\nDon't miss this opportunity to share an unforgettable movie night! 🍿🎉`,
                                scheduledStartTime: new Date(Date.now() + timeScheduledEvent[0] * 1000).toISOString(),
                                scheduledEndTime: new Date(Date.now() + timeScheduledEvent[0] * 1000 + timeScheduledEvent[1] * 1000).toISOString(),
                                privacyLevel: 2,
                                entityType: 3,
                                entityMetadata: {
                                    location: 'https://share-movie.web.app/',
                                },
                            });
                            
                            componentsEmbed = [new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('Login page')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL("https://share-movie.web.app/"),
                                    new ButtonBuilder()
                                        .setLabel('Event link')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(scheduledEvent.url),
                                )
                            ]
                        } else {
                            componentsEmbed = [new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('Login page')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL("https://share-movie.web.app/")
                                )
                            ]
                        }
                        
                        let messageMention = dataFields[3] !== 'No' ? `${dataFields[3]}` : ''
                        const channel = client.channels.cache.get(channelScheduledEvent);
                        await channel.send({ 
                            content: messageMention,
                            embeds: [new EmbedBuilder()
                                .setDescription("Watch the film live with all the members of the server and chat at the same time.")
                                .setTitle(`Entry code for ${interaction.guild.name} movie`)
                                .setThumbnail(interaction.guild.iconURL({ size: 2048, format: 'png' }))
                                .setFooter({ text: client.user.tag })
                                .addFields({ name: '**Login Code**', value: codeShare })
                                .setTimestamp()
                                .setColor(settings.embed.color)
                            ],
                            components: componentsEmbed,
                            ephemeral: true
                        });

                    } else {
                        await interaction.reply({ embeds: [new EmbedBuilder()
                            .setTitle('Invalid Administrator Code')
                            .setDescription('The administrator code you entered is incorrect. Please double-check your code and try again. If you need to retrieve the correct administrator code, you can use the command </admin_config_code:1271789881709953069>.')
                            .setColor(settings.embed.warning)
                        ], ephemeral: true });
                    }
                }
            });
        } else {
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('Session not created')
                    .setDescription('Please create a session using the </create_session:1271390669491142705> command before sharing a film on the server.')
                    .setColor(settings.embed.warning)
                    .setFooter({ text: client.user.tag, iconURL: client.user.iconURL })
                    .setTimestamp()
                ]
            });
        }
    },
};

