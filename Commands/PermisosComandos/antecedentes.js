const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');
const antecedentesSchema = require('../../Models/antecedentes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antecedentes')
        .setDescription('Agregar un antecedente a un usuario')
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le agregara el antecedente')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('cargo')
            .setDescription('El cargo del antecedente')
            .setRequired(true)
        ).addAttachmentOption(option => option
            .setName('fotos')
            .setDescription('Fotos del usuario')
            .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */
    async execute(interation, client) {
        try {
            const { options } = interation;
            const user = options.getUser('user');
            const cargo = options.getString('cargo');
            const fotos = options.getAttachment('fotos');

            const validarPermisos = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id, CommandPermiso: 'AntecedentesPolicias' });

            if (!validarPermisos) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const antecedentes = new antecedentesSchema({
                guildServidor: interation.guild.id,
                UsurioSancionado: user.username,
                IdUsuarioSancionado: user.id,
                Oficial: interation.user.username,
                IdOficial: interation.user.id,
                Cargo: cargo,
                UrlImagen: fotos.url
            });

            await antecedentes.save();

            const obtenerAno = new Date().getFullYear();

            const embed = new EmbedBuilder()
                .setTitle(`**ANTECEDENTE**`)
                .setColor('Red')
                .addFields([
                    { name: '**Oficial**', value: `${interation.user}` },
                    { name: '**Preso**', value: `${user}` },
                    { name: '**Cargo**', value: `${cargo}` }
                ])
                .setImage(fotos.url)
                .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                .setFooter({ text: `Palmera Vice | ${obtenerAno}` })

            return interation.reply({ embeds: [embed] });

        } catch (err) {
            console.log(err);
        }
    }
}
