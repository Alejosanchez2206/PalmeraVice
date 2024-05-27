const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType,
    EmbedBuilder
} = require('discord.js');

const permisosSchema = require('../../Models/permisos');
const sancionesSchema = require('../../Models/sanciones');
const canalesSchema = require('../../Models/canales');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-sancion')
        .setDescription('Agrega una sancion a un usuario')
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le agregara la sancion')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('razon')
            .setDescription('La razon de la sancion')
            .setRequired(true)
        ).addRoleOption(option => option
            .setName('rol')
            .setDescription('El rol al que se le agregara')
            .setRequired(true)
        ).addNumberOption(option => option
            .setName('reportes')
            .setDescription('El numero de reportes')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('observaciones')
            .setDescription('Las observaciones de la sancion')
            .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        try {
            const user = interation.options.getUser('user');
            const razon = interation.options.getString('razon');
            const rol = interation.options.getRole('rol');
            const observaciones = interation.options.getString('observaciones');
            const reportes = interation.options.getNumber('reportes');

            const validarPermiso = await permisosSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });
            if (!validarPermiso) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const ValidarSancion = await sancionesSchema.findOne({ guildServidor: interation.guild.id, IdUsuarioSancionado: user.id, IdAviso: rol.id });

            if (ValidarSancion) {
                return interation.reply({ content: 'El usuario ya tiene una sancion con este rol', ephemeral: true });
            }

            const sancion = new sancionesSchema({
                guildServidor: interation.guild.id,
                UsuarioSancionado: user.username,
                IdUsuarioSancionado: user.id,
                DetaillUser : user,
                Admin: interation.user.username,
                IdAdmin: interation.user.id,
                DetaillAdmin : interation.user,
                Razón: razon,
                Reportes: reportes,
                Aviso: rol.name,
                IdAviso: rol.id,
                DetaillAviso: rol,
                Observaciones: observaciones
            });

            await sancion.save();

            const obtenerAno = new Date().getFullYear();

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('**AVISO ANTIROL**')
                .addFields(
                    { name: 'Usuario', value: `${user}` },
                    { name: 'Admin', value: `${interation.user}` },
                    { name: 'Razon', value: `${razon}` },
                    { name: 'Aviso', value: `${rol}` },
                    { name: 'Reportes', value: `${reportes}` },
                    { name: 'Observaciones', value: `${observaciones}` },
                )
                .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless` )
                .setFooter({ text: `Palmera Vice | ${obtenerAno}` })


            const canal = await canalesSchema.findOne({ guildServidor: interation.guild.id, TipoCanal: 'Avisar anti rol' });

            const canalEnviarMensaje = interation.guild.channels.cache.get(canal.guildcanal);
            await canalEnviarMensaje.send({ content: `${user} ha sido sancionado`, embeds: [embed] });


            await interation.guild.members.cache.get(user.id).roles.add(rol.id);
            interation.reply({ content: `Se agrego la sancion a ${user.username}`, ephemeral: true });

        } catch (err) {
            console.log(err);
        }
    }


}