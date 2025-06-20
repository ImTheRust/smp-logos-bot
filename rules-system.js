const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const CONFIG = {
  BANNER_URL:
    "https://media.discordapp.net/attachments/1367945583465332767/1385668391020531864/1.png?ex=6856e7c0&is=68559640&hm=060ffba60b561f314bea87500de05d56c26fa58ad308865f01af5d9fa8117dea&=&format=webp&quality=lossless&width=1048&height=468",
  ROLES: {
    content: "1385512557971898450",
    designs: "1385512559238451203",
    events: "1385512561071358016",
    announcements: "1385512562573054032",
    leaks: "1385512563915231343",
  },
  RULES: {
    discord: new EmbedBuilder()
      .setTitle("📜 Discord Server Rules")
      .setColor("#5865F2")
      .setDescription(
        `**1. Be respectful**
This means no mean, rude, or harassing comments. Treat others the way you want to be treated.

**2. PSD Rules**
If you buy a psd do not share it with anyone else or use it as "proof" that you made the thumbnail.

**3. No spamming**
Please respect this rule. 

**4. No Reselling**
Please don't resell my services as your own work and steal my work for your portfolio or anything.

**5. No NSFW**
This is self-explanatory.

**6. Self Promo Rules**
No Self Promo other than <#1324757630958178415> and <#1324716637365997675> 

**7. Threats are forbidden**
Threats are prohibited and disallowed. Jokes about this subject aren't encouraged, either.

**8. Don't ping staff for useless stuff ect, don't waste our time**
You will get a strike if you do this.

**9. Follow the Discord Community Guidelines**
You can find them here: https://discordapp.com/guidelines

**10. English Only**
Please only speak English, as that's the only language I speak and this is an English server, if you speak a language that's not English you will be muted.
`
      )
      .addFields({
        name: "Disclaimer",
        value: `**The Admins and Moderators will Mute/Kick/Ban per discretion. If you feel mistreated DM an Admin and we will resolve the issue. If it was a false punishment they will get demoted.**

If you don't understand something, feel free to ask!

*Some rules aren't listed, just don't do anything that you think may get you punished*

**Your presence in this server implies accepting these rules, including all further changes. These changes might be done at any time without notice, it is your responsibility to check for them.**`,
      }),
    tos: new EmbedBuilder()
      .setTitle("📝 Order Terms of Service")
      .setColor("#5865F2")
      .setDescription(
        `
- Basic logos get 2 revisions, Premium logos get 4 revisions included
- Additional revisions available for extra cost
- All requirements must be specified before payment
- No new features can be added after payment
- PayPal payments only
`
      ),
  },
};

async function handleRulesPanel(interaction) {
   if (!interaction.member.permissions.has("Administrator")) {
    return interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
  }

  const bannerEmbed = new EmbedBuilder().setImage(CONFIG.BANNER_URL).setColor("#5865F2");

  const roleButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("role_content").setLabel("Content").setStyle(ButtonStyle.Secondary).setEmoji("📝"),
    new ButtonBuilder().setCustomId("role_designs").setLabel("Logos").setStyle(ButtonStyle.Secondary).setEmoji("🎨"),
    new ButtonBuilder().setCustomId("role_events").setLabel("Events").setStyle(ButtonStyle.Secondary).setEmoji("🎉"),
    new ButtonBuilder().setCustomId("role_announcements").setLabel("Announcements").setStyle(ButtonStyle.Secondary).setEmoji("📢"),
    new ButtonBuilder().setCustomId("role_leaks").setLabel("Leaks").setStyle(ButtonStyle.Secondary).setEmoji("💧")
  );

  const guidelinesMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("guidelines_menu")
      .setPlaceholder("View Server Guidelines")
      .addOptions([
        {
          label: "Order ToS",
          description: "Terms of service for ordering.",
          value: "tos",
          emoji: "⚙️",
        },
        {
          label: "Discord Rules",
          description: "View rules you must follow in the discord server.",
          value: "discord",
          emoji: "📜",
        },
      ])
  );

  await interaction.channel.send({
    embeds: [bannerEmbed],
    components: [roleButtons, guidelinesMenu],
  });

  await interaction.reply({ content: "Rules panel created successfully!", ephemeral: true });
}


async function handleRoleButton(interaction) {
    const roleName = interaction.customId.split("_")[1];
    const roleId = CONFIG.ROLES[roleName];
    
    if(!roleId) return;

    const role = interaction.guild.roles.cache.get(roleId);
    if(!role) {
        return interaction.reply({ content: `Role "${roleName}" not found.`, ephemeral: true });
    }

    const hasRole = interaction.member.roles.cache.has(roleId);

    if (hasRole) {
        await interaction.member.roles.remove(role);
        await interaction.reply({ content: `You no longer have the **${role.name}** role.`, ephemeral: true });
    } else {
        await interaction.member.roles.add(role);
        await interaction.reply({ content: `You have been given the **${role.name}** role!`, ephemeral: true });
    }
}

async function handleGuidelinesMenu(interaction) {
    const selection = interaction.values[0];
    const embed = CONFIG.RULES[selection];

    if (embed) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}


module.exports = {
  handleRulesPanel,
  handleRoleButton,
  handleGuidelinesMenu,
}; 