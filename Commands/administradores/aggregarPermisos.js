const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} = require('discord.js');

const permisosSchema = require('../../Models/permisos');
const permisosEspecialSchema = require('../../Models/permisosEspecial');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-permisos')
        .setDescription('Agrega un permiso a un usuario para usar el bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le agregara el permiso')
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

            const validarEspecial = await permisosEspecialSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });
            
            if (!validarEspecial) { return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true }); }

                const validarUsuario = await permisosSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: user.id });

                if (validarUsuario) {
                    return interation.reply({ content: 'El usuario ya tiene permisos para usar el bot', ephemeral: true });
                }

                const permisos = new permisosSchema({
                    guildServidor: interation.guild.id,
                    guildUsuario: user.id,
                    userName: user.username,
                    guildAsignado: interation.user.id,
                    userAsignado: interation.user.username
                });
                await permisos.save();

                interation.reply({ content: `Se agrego el permiso para el usuario ${user.username}`, ephemeral: true });

            
        } catch (err) {
            console.log(err);
        }
    }
}