const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} = require('discord.js');

const permisosSchema = require('../../Models/permisos');
const sancionesSchema = require('../../Models/sanciones');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('consultar-usuario')
        .setDescription('Muestra las sanciones de un usuario')
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le consultan las sanciones')
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

            const validarPermiso = await permisosSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });
            if (!validarPermiso) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const sanciones = await sancionesSchema.find({ guildServidor: interation.guild.id, IdUsuarioSancionado: user.id });

            if (sanciones.length === 0) {
                return interation.reply({ content: `El usuario ${user} no tiene ninguna sancion`});
            }

            const obtenerAno = new Date().getFullYear();

            const embed = new EmbedBuilder()
                .setTitle(`Sanciones de ${user.username}`)
                .setColor('Blue')
                .addFields(sanciones.map(sancion => ({
                    name: `Rol: ${sancion.Aviso}`,
                    value: `Admin: ${sancion.Admin}\nRazon: ${sancion.Razon}\nReportes: ${sancion.Reportes}\nObservaciones: ${sancion.Observaciones}`
                })))
                .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless` )
                .setFooter({ text: `Palmera Vice | ${obtenerAno}` })

            return interation.reply({ content: `Sanciones de ${user.username}`, embeds: [embed] });
        } catch (err) {            
            console.log(err);
        }
    }
}
    
