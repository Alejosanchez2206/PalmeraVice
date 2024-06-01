const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');
const permisosEspecialSchema = require('../../Models/permisosEspecial');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('retirar-permisos-command')
        .setDescription('Retira un permiso a un usuario para usar un comando del bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le retirara el permiso')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('permiso')
            .setDescription('El permiso que se retirara')
            .setRequired(true)
            .addChoices(
                { name: 'AntecedentesPolicias', value: 'AntecedentesPolicias' },
                { name: 'FakeMessage', value: 'FakeMessage' },
                { name: 'Sanciones', value: 'Sanciones' },
            )
        ),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const user = options.getUser('user');
            const permiso = options.getString('permiso');

            const validaEspecial = await permisosEspecialSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });

            if (!validaEspecial) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const ValidarPermiso = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: user.id, CommandPermiso: permiso });

            if (!ValidarPermiso) {
                return interation.reply({ content: 'El usuario no tiene permisos aggregados para usar este comando', ephemeral: true });
            }

            await permisosCommand.findOneAndDelete({ guildServidor: interation.guild.id, guildUsuario: user.id, CommandPermiso: permiso });
            interation.reply({ content: `Se retiro el permiso para el usuario ${user.username}`, ephemeral: true });
        } catch (err) {
            console.log(err);
        }
    }
}