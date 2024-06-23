const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');
const organizacionSchema = require('../../Models/sancionesOrg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resumen-puntosorg')
        .setDescription('Detalles de una organizacion'),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */
    async execute(interation, client) {
        try {

            const validarPermisos = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id, CommandPermiso: 'ResumenSancionOrg' });

            if (!validarPermisos) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const consultarSancionesOrg = await organizacionSchema.aggregate([
                { $match: { guildServidor: interation.guild.id } },
                {
                    $group: {
                        _id: {
                            orgSancionada: '$orgSancionada',
                            idOrgSancionada: '$idOrgSancionada'
                        },
                        total: { $sum: '$puntosSancion' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orgSancionada: '$_id.orgSancionada',
                        idOrgSancionada: '$_id.idOrgSancionada',
                        total: '$total'
                    }
                },
                {
                    $sort: { total: -1 }
                }
            ]);

       
            const embed = new EmbedBuilder()
                .setTitle('Resumen de puntos de organizaciones')
                .setColor('Blue')
                .addFields(consultarSancionesOrg.map(sancion => ({
                    name: `Organizacion: ${sancion.orgSancionada}`,
                    value: `Puntos: ${sancion.total}`
                })))
                .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                .setFooter({ text: `Palmera Vice | ${new Date().getFullYear()}` })

            return interation.reply({ embeds: [embed] });

        } catch (err) {
            console.log(err);
        }
    }
}