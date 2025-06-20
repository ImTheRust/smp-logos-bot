const { EmbedBuilder } = require("discord.js");

const WELCOME_CHANNEL_ID = "1385512578725449779";

async function handleWelcome(member) {
  const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor("#00ff00")
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`Hello ${member}, we're glad to have you here! Please make sure to read the rules and enjoy your stay.`)
    .setTimestamp();

  channel.send({ embeds: [welcomeEmbed] });
}

module.exports = {
    handleWelcome
}; 