const { Client, GatewayIntentBits, EmbedBuilder, ApplicationCommandType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Command definitions
const commands = [
  {
    name: 'profile',
    description: 'Shows information about your Discord profile',
    type: ApplicationCommandType.ChatInput
  }
];

client.once('ready', () => {
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
      console.log('Registered commands globally');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'profile') {
    await handleProfileCommand(interaction);
  }
});

async function handleProfileCommand(interaction) {
  const user = interaction.user;
  const member = interaction.member;
  
  // Get user's avatar URL
  const avatarURL = user.displayAvatarURL({ size: 256, dynamic: true });
  
  // Calculate account age
  const accountAge = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
  
  // Calculate server join date (if member is available)
  let serverJoinAge = null;
  if (member && member.joinedTimestamp) {
    serverJoinAge = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
  }
  
  // Get user roles (excluding @everyone)
  const roles = member ? member.roles.cache
    .filter(role => role.id !== interaction.guild.id)
    .map(role => role.name)
    .join(', ') || 'No roles' : 'N/A';
  
  // Create embed
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Profile: ${user.username}`)
    .setThumbnail(avatarURL)
    .addFields(
      { name: '👤 Username', value: user.username, inline: true },
      { name: '🆔 User ID', value: user.id, inline: true },
      { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
      { name: '⏰ Account Age', value: `${accountAge} days`, inline: true },
      { name: '🎭 Display Name', value: member?.displayName || user.username, inline: true },
      { name: '🏷️ Roles', value: roles, inline: false }
    )
    .setFooter({ text: `Requested by ${user.username}`, iconURL: avatarURL })
    .setTimestamp();
  
  // Add server join info if available
  if (serverJoinAge !== null) {
    embed.addFields(
      { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
      { name: '⏱️ Server Member For', value: `${serverJoinAge} days`, inline: true }
    );
  }
  
  // Add status if available
  if (member?.presence?.status) {
    const statusEmoji = {
      'online': '🟢',
      'idle': '🟡',
      'dnd': '🔴',
      'offline': '⚫'
    };
    embed.addFields({ 
      name: '📊 Status', 
      value: `${statusEmoji[member.presence.status] || '❓'} ${member.presence.status}`, 
      inline: true 
    });
  }
  
  await interaction.reply({ embeds: [embed] });
}

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN); 