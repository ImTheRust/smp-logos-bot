const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
require("dotenv").config();
const ticketSystem = require("./ticket-system.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

// Command definitions
const commands = [
  {
    name: "profile",
    description: "Shows information about your Discord profile",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "review",
    description: "Leave a review for a product or service",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "ticket-panel",
    description: "Create the main ticket panel (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-help",
    description: "Show ticket status definitions (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-new-comm",
    description: "Set ticket status to New Commission (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-waiting-on-updates",
    description: "Set ticket status to Waiting on Updates (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-comm-paused",
    description: "Set ticket status to Commission Paused (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-being-made",
    description: "Set ticket status to Being Made (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
  {
    name: "status-comm-fully-done",
    description: "Set ticket status to Commission Fully Done (owner only).",
    type: ApplicationCommandType.ChatInput,
  },
];

const REVIEW_ROLE_ID = "1385512549428236299";
const REVIEW_CHANNEL_ID = "1385512596878262375";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  registerCommands();
});

async function registerCommands() {
  try {
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      // Register commands for a specific guild (faster for testing)
      await client.application.commands.set(commands, guildId);
      console.log(`Registered commands for guild: ${guildId}`);
    } else {
      // Register commands globally
      await client.application.commands.set(commands);
      console.log("Registered commands globally");
    }
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === "profile") {
      await handleProfileCommand(interaction);
    } else if (commandName === "review") {
      await handleReviewCommand(interaction);
    } else if (commandName === "ticket-panel") {
      await ticketSystem.handleTicketPanel(interaction);
    } else if (commandName === "status-help") {
       if (!interaction.member.roles.cache.has(ticketSystem.CONFIG.OWNER_ROLE_ID)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
       }
       await interaction.reply({ embeds: [ticketSystem.CONFIG.STATUS_HELP_EMBED], ephemeral: true });
    } else if (commandName.startsWith("status-")) {
        await ticketSystem.handleStatus(interaction);
    }
  } else if (interaction.isButton()) {
    const { customId } = interaction;
    if (customId === "leave_review_button") {
      await handleReviewCommand(interaction);
    } else if (["prices_button", "payment_button", "back_to_main_panel"].includes(customId)) {
        await ticketSystem.handlePanelButtons(interaction);
    } else {
        await ticketSystem.handleTicketButtons(interaction);
    }
  } else if (interaction.isModalSubmit()) {
     const { customId } = interaction;
    if (customId === "review_modal") {
      await handleReviewModalSubmit(interaction);
    } else if (customId === 'add_user_modal') {
      await ticketSystem.handleAddUserModal(interaction);
    } else {
      await ticketSystem.handleModalSubmit(interaction);
    }
  } else if (interaction.isStringSelectMenu()) {
      if(interaction.customId === 'ticket_select_menu') {
          await ticketSystem.handleSelectMenu(interaction);
      }
  }
});

async function handleReviewCommand(interaction) {
  if (!interaction.member.roles.cache.has(REVIEW_ROLE_ID)) {
    return interaction.reply({
      content: "You do not have the required role to leave a review.",
      ephemeral: true,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("review_modal")
    .setTitle("Leave a Review");

  const productInput = new TextInputBuilder()
    .setCustomId("product_input")
    .setLabel("What product/service are you reviewing?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("e.g., Basic Logo, Thumbnail Design")
    .setRequired(true);

  const ratingInput = new TextInputBuilder()
    .setCustomId("rating_input")
    .setLabel("Rating (1-5)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Please enter a number from 1 to 5")
    .setMinLength(1)
    .setMaxLength(1)
    .setRequired(true);

  const feedbackInput = new TextInputBuilder()
    .setCustomId("feedback_input")
    .setLabel("Detailed Feedback")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Describe your experience...")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(productInput),
    new ActionRowBuilder().addComponents(ratingInput),
    new ActionRowBuilder().addComponents(feedbackInput)
  );

  await interaction.showModal(modal);
}

async function handleReviewModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const product = interaction.fields.getTextInputValue("product_input");
  const rating = parseInt(interaction.fields.getTextInputValue("rating_input"));
  const feedback = interaction.fields.getTextInputValue("feedback_input");

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return interaction.editReply({
      content: "Invalid rating. Please provide a number between 1 and 5.",
      ephemeral: true,
    });
  }

  const reviewChannel = await client.channels.fetch(REVIEW_CHANNEL_ID);
  if (!reviewChannel) {
    console.error(`Could not find review channel with ID: ${REVIEW_CHANNEL_ID}`);
    return interaction.editReply({
      content: "An error occurred. Could not find the reviews channel.",
      ephemeral: true,
    });
  }

  const starRating = "⭐".repeat(rating) + "☆".repeat(5 - rating);

  const reviewEmbed = new EmbedBuilder()
    .setAuthor({
      name: `Review from ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`New Review for ${product}!`)
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setDescription(`*“${feedback}”*`)
    .addFields({ name: "Rating", value: starRating, inline: false })
    .setColor("#FFD700")
    .setTimestamp()
    .setFooter({
      text: "SMP Logos Bot • Review System",
      iconURL: client.user.displayAvatarURL(),
    });

  const reviewButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("leave_review_button")
      .setLabel("Leave Your Own Review")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("✍️")
  );

  await reviewChannel.send({
    embeds: [reviewEmbed],
    components: [reviewButton],
  });

  await interaction.editReply({
    content: "Thank you! Your review has been submitted successfully.",
    ephemeral: true,
  });
}

async function handleProfileCommand(interaction) {
  const user = interaction.user;
  const member = interaction.member;

  // Get user's avatar URL
  const avatarURL = user.displayAvatarURL({ size: 256, dynamic: true });

  // Calculate account age
  const accountAge = Math.floor(
    (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24)
  );

  // Calculate server join date (if member is available)
  let serverJoinAge = null;
  if (member && member.joinedTimestamp) {
    serverJoinAge = Math.floor(
      (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)
    );
  }

  // Get user roles (excluding @everyone)
  const roles =
    member
      ? member.roles.cache
          .filter((role) => role.id !== interaction.guild.id)
          .map((role) => role.name)
          .join(", ") || "No roles"
      : "N/A";

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Profile: ${user.username}`)
    .setThumbnail(avatarURL)
    .addFields(
      { name: "👤 Username", value: user.username, inline: true },
      { name: "🆔 User ID", value: user.id, inline: true },
      {
        name: "📅 Account Created",
        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
        inline: false,
      },
      { name: "⏰ Account Age", value: `${accountAge} days`, inline: true },
      {
        name: "🎭 Display Name",
        value: member?.displayName || user.username,
        inline: true,
      },
      { name: "🏷️ Roles", value: roles, inline: false }
    )
    .setFooter({ text: `Requested by ${user.username}`, iconURL: avatarURL })
    .setTimestamp();

  // Add server join info if available
  if (serverJoinAge !== null) {
    embed.addFields(
      {
        name: "📥 Joined Server",
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
        inline: false,
      },
      { name: "⏱️ Server Member For", value: `${serverJoinAge} days`, inline: true }
    );
  }

  // Add status if available
  if (member?.presence?.status) {
    const statusEmoji = {
      online: "🟢",
      idle: "🟡",
      dnd: "🔴",
      offline: "⚫",
    };
    embed.addFields({
      name: "📊 Status",
      value: `${statusEmoji[member.presence.status] || "❓"} ${
        member.presence.status
      }`,
      inline: true,
    });
  }

  await interaction.reply({ embeds: [embed] });
}

// Error handling
client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Login
client.login(process.env.DISCORD_TOKEN); 