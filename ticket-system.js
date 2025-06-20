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
    .addFields(
      { name: "💰 Basic Logo", value: "$11-15\nCustom SMP Design\n2 Revisions Included\nHigh Resolution Files", inline: true },
      { name: "💰 Premium Logo", value: "$16-20\nCustom SMP Design\n4 Revisions Included\nHigh Resolution Files\nExtra Details & Effects", inline: true }
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
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('request_details').setLabel("Request Details").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('due_date').setLabel("Due Date").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('additional_info').setLabel("Additional Information").setStyle(TextInputStyle.Paragraph).setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('color_palette').setLabel("Color Palette").setStyle(TextInputStyle.Short).setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('budget').setLabel("Budget").setStyle(TextInputStyle.Short).setRequired(true))
        ),
    support: new ModalBuilder()
        .setCustomId('support_ticket_modal')
        .setTitle('New Support Ticket')
        .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('support_issue').setLabel("Please describe your issue in detail.").setStyle(TextInputStyle.Paragraph).setRequired(true))),
    application: new ModalBuilder()
        .setCustomId('application_ticket_modal')
        .setTitle('New Application Ticket')
        .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q1').setLabel("Experience with Discord communities?").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q2').setLabel("How do you handle staff arguments?").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q3').setLabel("Approach to enforcing rules?").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            // Add more questions as needed, modals have a 5-component limit. This is a simplified version.
             new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('q4').setLabel("Why do you want to be a manager here?").setStyle(TextInputStyle.Paragraph).setRequired(true))
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
    let type, embed, channelName;

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
        embed = new EmbedBuilder().setTitle(`Application from ${user.username}`).setColor("#9B59B6")
            .addFields(
                { name: "Experience with Discord communities?", value: fields.getTextInputValue('q1')},
                { name: "How do you handle staff arguments?", value: fields.getTextInputValue('q2')},
                { name: "Approach to enforcing rules?", value: fields.getTextInputValue('q3')},
                { name: "Why do you want to be a manager here?", value: fields.getTextInputValue('q4')}
            );
    } else {
        return;
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
            ],
        });

        const ticketButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`close_ticket_request_${user.id}`).setLabel("Close Ticket").setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('add_user_to_ticket').setLabel("Add User").setStyle(ButtonStyle.Primary).setEmoji('👤'),
        );
        if (type === 'order') {
             ticketButtons.addComponents(new ButtonBuilder().setLabel("Pay Now").setStyle(ButtonStyle.Link).setURL(CONFIG.PAY_NOW_URL).setEmoji('💸'));
        }

        await channel.send({ content: `Welcome <@${user.id}>! <@&${CONFIG.OWNER_ROLE_ID}> will be with you shortly.`, embeds: [embed], components: [ticketButtons] });
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
        if (member.id !== userId && !member.roles.cache.has(CONFIG.OWNER_ROLE_ID)) {
            return interaction.reply({ content: "You cannot initiate closing this ticket.", ephemeral: true });
        }
        const confirmEmbed = new EmbedBuilder().setTitle("Confirmation").setDescription(`Are you sure you want to close this ticket? This action cannot be undone.\n\n<@${member.id}> has requested to close this ticket. An admin must confirm.` ).setColor("Yellow");
        const confirmButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_close_ticket').setLabel("Close").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel_close_ticket').setLabel("Cancel").setStyle(ButtonStyle.Danger),
        );
        await interaction.update({ embeds: [confirmEmbed], components: [confirmButtons] });

    } else if (customId === 'confirm_close_ticket') {
        if (!member.roles.cache.has(CONFIG.OWNER_ROLE_ID)) {
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
     if (!interaction.member.roles.cache.has(CONFIG.OWNER_ROLE_ID)) {
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


module.exports = {
  handleTicketPanel,
  handlePanelButtons,
  handleSelectMenu,
  handleModalSubmit,
  handleTicketButtons,
  handleAddUserModal,
  handleStatus,
  CONFIG,
}; 