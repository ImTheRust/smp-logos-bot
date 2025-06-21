const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit a logo to the gallery.')
        .setDefaultMemberPermissions(0)
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The logo image to submit.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the logo.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('A description for the logo.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('price')
                .setDescription('The price of the logo.')
                .setRequired(true)),
    async execute(interaction) {
        const ownerRoleId = '1385512540532113408';
        if (!interaction.member.roles.cache.has(ownerRoleId)) {
            return interaction.reply({ content: 'This command is for the bot owner only.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const image = interaction.options.getAttachment('image');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const price = interaction.options.getString('price');

        const galleryChannelId = '1385512598060925011';
        const galleryChannel = await interaction.client.channels.fetch(galleryChannelId);

        if (!galleryChannel) {
            return interaction.editReply({ content: 'Could not find the gallery channel.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(0x5865F2) // Discord blurple
            .setImage(image.url)
            .addFields(
                { name: '💰 Price', value: price, inline: true },
                { name: '🎨 Artist', value: 'RustFX', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'RustFX Studios', iconURL: interaction.client.user.displayAvatarURL() });

        try {
            const message = await galleryChannel.send({ embeds: [embed] });
            await message.react('🔥');
            await message.react('⭐');

            await interaction.editReply({ content: 'Successfully submitted the logo to the gallery!', ephemeral: true });
        } catch (error) {
            console.error('Failed to send message to gallery channel:', error);
            await interaction.editReply({ content: 'There was an error while submitting the logo.', ephemeral: true });
        }
    },
}; 