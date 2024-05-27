const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-host')
        .setDescription('Agrega un host a un usuario')
        .addStringOption(option => option
            .setName('nombre-roblox')
            .setDescription('Nombre de roblox')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('nombre-visualizacion')
            .setDescription('El nombre visible en roblox')
            .setRequired(true)
        ).addUserOption(option => option
            .setName('nombre-discord')
            .setDescription('El nombre de usuario en discord')
            .setRequired(true)
        ),

       /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */
    
    async execute(interaction, client) {
        const { options, user } = interaction;
        const roblox = options.getString('nombre-roblox');
        const visual = options.getString('nombre-visualizacion');
        const discord = options.getUser('nombre-discord');

        const obtenerAno = new Date().getFullYear();
        
        const embed = new EmbedBuilder()
            .setTitle('Solicitado por ' + user.username)
            .setColor('Blue')
            .addFields([
                { name: 'Nombre De Roblox', value: `${roblox}` },
                { name: 'Nombre Visualizacion', value: `${visual}` },
                { name: 'Nombre de Discord', value: `${discord}` }
            ])
            .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless` )
            .setFooter({ text: `Palmera Vice | ${obtenerAno}` })
            return interaction.reply({ embeds: [embed] });
    }
}