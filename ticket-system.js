const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");

// Configuration
const CONFIG = {
  OWNER_ROLE_ID: "1385512540532113408",
  TICKET_MOD_ROLE_ID: "1385556805865701447",
  TICKET_CATEGORIES: {
    order: "1385627882528706570",
    support: "1385627924304105595",
    application: "1385627958697267351",
  },
  TRANSCRIPTS_CHANNEL_ID: "1385513556883144844",
  BANNER_IMAGE_URL: "https://media.discordapp.net/attachments/1367945583465332767/1385627211901698108/1.png?ex=6856c167&is=68556fe7&hm=ea86b8fa1333275ae4a9a664e527e99914a013d929f9514e8b6b30d4f4b65acc&=&format=webp&quality=lossless&width=1048&height=468",
  PRICES_EMBED: new EmbedBuilder()
    .setTitle("💰 Products & Prices")
    .setColor("#5865F2")
    .setDescription(
      "**🖼️ Logos**\n" +
      "\n" +
      "**💰 Basic Logo**\n$11-15\nCustom SMP Design\n2 Revisions Included\nHigh Resolution Files\n" +
      "\n" +
      "**💰 Premium Logo**\n$16-20\nCustom SMP Design\n4 Revisions Included\nHigh Resolution Files\nExtra Details & Effects\n" +
      "\n" +
      "**🎬 Thumbnails**\n" +
      "\n" +
      "**Simple Thumbnail:** $5-7\n" +
      "**Standard Thumbnail:** $7-10\n" +
      "**Premium Thumbnail:** $10-15\n"
    ),
  PAYMENT_METHODS_EMBED: new EmbedBuilder()
    .setTitle("💳 Payment Methods")
    .setDescription("Payments Via:\nPayPal & Card & Ko-Fi & Payhip")
    .setColor("#5865F2"),
  PAY_NOW_URL: "https://smplogos.com/#payment-steps",
  STATUS_HELP_EMBED: new EmbedBuilder()
      .setTitle("Status Command Help")
      .setDescription(
        "🔴 `/status-new-comm` - New Commission\n" +
        "🟣 `/status-waiting-on-updates` - Waiting on Updates\n" +
        "🟡 `/status-comm-paused` - Commission Paused\n" +
        "🟢 `/status-being-made` - Being Made\n" +
        "🔵 `/status-comm-fully-done` - Commission Fully Done"
      )
      .setColor("#5865F2"),
};

const TICKET_MODALS = {
    order: new ModalBuilder()
        .setCustomId('order_ticket_modal')
        .setTitle('New Order Ticket')
        .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('request_details').setLabel("What are you looking to order?").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('due_date').setLabel("What is the due date?").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('additional_info').setLabel("Any additional information?").setStyle(TextInputStyle.Paragraph).setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('color_palette').setLabel("Color palette preference?").setStyle(TextInputStyle.Short).setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('budget').setLabel("What is your budget?").setStyle(TextInputStyle.Short).setRequired(true))
        ),
    support: new ModalBuilder()
        .setCustomId('support_ticket_modal')
        .setTitle('New Support Ticket')
        .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('support_issue').setLabel("Please describe your issue").setStyle(TextInputStyle.Paragraph).setRequired(true))),
    application: new ModalBuilder()
        .setCustomId('application_ticket_modal')
        .setTitle('New Staff Application')
        .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('app_q1_region').setLabel("What is your timezone / region?").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('app_q2_hours').setLabel("How many hours can you be online weekly?").setStyle(TextInputStyle.Short).setRequired(true))
        )
};


// Handlers
async function handleTicketPanel(interaction) {
    if (!interaction.member.roles.cache.has(CONFIG.OWNER_ROLE_ID)) {
        return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    }
    const mainEmbed = new EmbedBuilder()
        .setTitle("Rusts GFX | Store")
        .setColor("#5865F2")
        .setImage(CONFIG.BANNER_IMAGE_URL);

    const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('ticket_select_menu')
            .setPlaceholder('Create a Ticket')
            .addOptions([
                { label: 'Order', description: 'Place a new order.', value: 'order', emoji: '🛒' },
                { label: 'Support', description: 'Get help or ask questions.', value: 'support', emoji: '❓' },
                { label: 'Application', description: 'Apply for a position.', value: 'application', emoji: '📄' }
            ])
    );
    
    const infoRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prices_button').setLabel('Prices').setStyle(ButtonStyle.Success).setEmoji('💰'),
        new ButtonBuilder().setCustomId('payment_button').setLabel('Payment').setStyle(ButtonStyle.Primary).setEmoji('💳'),
        new ButtonBuilder().setCustomId('status_button').setLabel('Status').setStyle(ButtonStyle.Secondary).setEmoji('📊')
    );

    await interaction.channel.send({ embeds: [mainEmbed], components: [menuRow, infoRow] });
    await interaction.reply({ content: "Ticket panel created successfully!", ephemeral: true });
}

async function handlePanelButtons(interaction) {
    const { customId } = interaction;

    if (customId === "prices_button") {
        await interaction.reply({
            embeds: [CONFIG.PRICES_EMBED],
            ephemeral: true,
        });
    } else if (customId === "payment_button") {
        await interaction.reply({
            embeds: [CONFIG.PAYMENT_METHODS_EMBED],
            ephemeral: true,
        });
    } else if (customId === "status_button") {
        const statusEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setDescription(
                ":red_circle: - New Commission\n" +
                ":purple_circle: - Waiting on Updates\n" +
                ":yellow_circle: - Commission Paused\n" +
                ":green_circle: - Being Made\n" +
                ":blue_circle: - Commission Fully Done"
            );
        await interaction.reply({
            embeds: [statusEmbed],
            ephemeral: true,
        });
    }
}

async function handleSelectMenu(interaction) {
    const type = interaction.values[0];
    if (TICKET_MODALS[type]) {
        await interaction.showModal(TICKET_MODALS[type]);
    }
}

async function handleModalSubmit(interaction) {
    const { customId, guild, fields, user } = interaction;
    let type, embeds = [], channelName;

    await interaction.deferReply({ ephemeral: true });

    if (customId === 'order_ticket_modal') {
        type = 'order';
        channelName = `🔴・order-${user.username}`;
        embed = new EmbedBuilder()
            .setTitle(`Order Ticket for ${user.username}`)
            .setColor("#E67E22")
            .addFields(
                { name: "Request Details", value: fields.getTextInputValue('request_details') },
                { name: "Due Date", value: fields.getTextInputValue('due_date') },
                { name: "Additional Information", value: fields.getTextInputValue('additional_info') || 'None' },
                { name: "Color Palette", value: fields.getTextInputValue('color_palette') || 'None' },
                { name: "Budget", value: fields.getTextInputValue('budget') }
            )
            .setTimestamp()
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() });
    } else if (customId === 'support_ticket_modal') {
        type = 'support';
        channelName = `⚪️・support-${user.username}`;
        embed = new EmbedBuilder().setTitle("Support Ticket").setDescription(fields.getTextInputValue('support_issue')).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setColor("#3498DB");
    } else if (customId === 'application_ticket_modal') {
        type = 'application';
        channelName = `🔵・app-${user.username}`;
        
        const initialAnswersEmbed = new EmbedBuilder()
            .setTitle(`Application from ${user.username}`)
            .setColor("#9B59B6")
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
            .addFields(
                { name: "Timezone / Region", value: fields.getTextInputValue('app_q1_region')},
                { name: "Weekly Hours Online", value: fields.getTextInputValue('app_q2_hours')}
            )
            .setTimestamp();

        const questionsEmbed = new EmbedBuilder()
            .setTitle("📝 Please answer the following questions:")
            .setColor("#9B59B6")
            .setDescription(
                "1. What experience do you have managing or moderating Discord communities?\n\n" +
                "2. How would you handle a situation where two staff members are arguing in public channels?\n\n" +
                "3. What's your approach to enforcing rules fairly but firmly?\n\n" +
                "4. How do you motivate and manage a team of moderators or staff?\n\n" +
                "5. If the server suddenly gets raided, what's your first response?\n\n" +
                "6. Have you ever had to remove someone from a team you were managing? Why and how?\n\n" +
                "7. How do you keep the server active and engaged over time?\n\n" +
                "8. What tools or bots are you familiar with for moderation or server management?\n\n" +
                "9. How would you balance being friendly with members and staying professional as staff?\n\n" +
                "10. Why do you want to be a manager on this specific server?"
            );

        embeds.push(initialAnswersEmbed, questionsEmbed);
    } else {
        return;
    }
    
    // This part handles single-embed cases
    if (embeds.length === 0 && embed) {
        embeds.push(embed);
    }

    try {
        const category = CONFIG.TICKET_CATEGORIES[type];
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                { id: CONFIG.OWNER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
                { id: CONFIG.TICKET_MOD_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
            ],
        });

        const ticketButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`close_ticket_request_${user.id}`).setLabel("Close Ticket").setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('add_user_to_ticket').setLabel("Add User").setStyle(ButtonStyle.Primary).setEmoji('👤'),
        );
        if (type === 'order') {
             ticketButtons.addComponents(new ButtonBuilder().setLabel("Pay Now").setStyle(ButtonStyle.Link).setURL(CONFIG.PAY_NOW_URL).setEmoji('💸'));
        }

        await channel.send({ content: `Welcome <@${user.id}>! <@&${CONFIG.OWNER_ROLE_ID}> will be with you shortly.`, embeds: embeds, components: [ticketButtons] });
        await interaction.editReply({ content: `Your ticket has been created: <#${channel.id}>`, ephemeral: true });

    } catch (error) {
        console.error("Error creating ticket channel:", error);
        await interaction.editReply({ content: "An error occurred while creating your ticket.", ephemeral: true });
    }
}

async function handleTicketButtons(interaction) {
    const { customId, member } = interaction;

    if (customId.startsWith('close_ticket_request')) {
        const userId = customId.split('_')[3];
        if (member.id !== userId && !member.roles.cache.has(CONFIG.OWNER_ROLE_ID) && !member.roles.cache.has(CONFIG.TICKET_MOD_ROLE_ID)) {
            return interaction.reply({ content: "You cannot initiate closing this ticket.", ephemeral: true });
        }
        const confirmEmbed = new EmbedBuilder().setTitle("Confirmation").setDescription(`Are you sure you want to close this ticket? This action cannot be undone.\n\n<@${member.id}> has requested to close this ticket. An admin must confirm.` ).setColor("Yellow");
        const confirmButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_close_ticket').setLabel("Close").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel_close_ticket').setLabel("Cancel").setStyle(ButtonStyle.Danger),
        );
        await interaction.update({ embeds: [confirmEmbed], components: [confirmButtons] });

    } else if (customId === 'confirm_close_ticket') {
        if (!member.roles.cache.has(CONFIG.OWNER_ROLE_ID) && !member.roles.cache.has(CONFIG.TICKET_MOD_ROLE_ID)) {
            return interaction.reply({ content: "You do not have permission to close this ticket.", ephemeral: true });
        }
        await interaction.update({ content: "Closing and archiving ticket...", components: [], embeds: [] });
        const channel = interaction.channel;
        const attachment = await discordTranscripts.createTranscript(channel);
        const transcriptsChannel = await interaction.guild.channels.fetch(CONFIG.TRANSCRIPTS_CHANNEL_ID);
        
        const transcriptEmbed = new EmbedBuilder()
            .setAuthor({ name: `Ticket Closed by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`Transcript for #${channel.name}`)
            .setColor("Red")
            .setTimestamp();

        await transcriptsChannel.send({ embeds: [transcriptEmbed], files: [attachment] });
        await channel.delete();

    } else if (customId === 'cancel_close_ticket') {
        // This is complex because we need the original embed and buttons.
        // A simple approach is to just send a message.
        await interaction.message.delete();
        await interaction.reply("Ticket closure has been cancelled.");

    } else if (customId === 'add_user_to_ticket') {
        const modal = new ModalBuilder().setCustomId('add_user_modal').setTitle('Add User to Ticket').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user_id_to_add').setLabel("User ID or @mention").setStyle(TextInputStyle.Short).setRequired(true)));
        await interaction.showModal(modal);
    }
}

async function handleStatus(interaction) {
     if (!interaction.member.roles.cache.has(CONFIG.OWNER_ROLE_ID) && !interaction.member.roles.cache.has(CONFIG.TICKET_MOD_ROLE_ID)) {
        return interaction.reply({ content: "You do not have permission to use status commands.", ephemeral: true });
    }
    const command = interaction.commandName;
    const channel = interaction.channel;
    
    if(!channel.name.includes('order-')) {
        return interaction.reply({content: "This command can only be used in order tickets.", ephemeral: true});
    }

    const baseName = channel.name.substring(channel.name.indexOf('・') + 1);
    let newName;

    switch(command) {
        case 'status-new-comm': newName = `🔴・${baseName}`; break;
        case 'status-waiting-on-updates': newName = `🟣・${baseName}`; break;
        case 'status-comm-paused': newName = `🟡・${baseName}`; break;
        case 'status-being-made': newName = `🟢・${baseName}`; break;
        case 'status-comm-fully-done': newName = `🔵・${baseName}`; break;
        default: return;
    }
    
    await channel.setName(newName);
    await interaction.reply({content: `Ticket status updated to: ${newName.split('・')[0]}`, ephemeral: true});
}

async function handleAddUserModal(interaction) {
    const userId = interaction.fields.getTextInputValue('user_id_to_add').replace(/<@!?|>/g, '');
    const user = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!user) {
        return interaction.reply({ content: "Could not find that user.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true
    });

    await interaction.reply({ content: `Added ${user} to this ticket.` });
}

async function handleTicketSelectCommand(interaction) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select_menu')
        .setPlaceholder('Select a ticket type...')
        .addOptions([
            { label: '🛒 Order', description: 'Place a new order.', value: 'order' },
            { label: '❓ Support', description: 'Get help or ask questions.', value: 'support' },
            { label: '📄 Application', description: 'Apply for a position.', value: 'application' },
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: 'Please select the type of ticket you would like to create from the dropdown below.',
        components: [row],
    });
}

module.exports = {
  handleTicketPanel,
  handlePanelButtons,
  handleSelectMenu,
  handleModalSubmit,
  handleTicketButtons,
  handleAddUserModal,
  handleTicketSelectCommand,
  handleStatus,
  CONFIG,
}; 