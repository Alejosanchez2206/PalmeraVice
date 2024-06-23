const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');
const permisosEspecialSchema = require('../../Models/permisosEspecial');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-permisos-command')
        .setDescription('Agrega un permiso a un usuario para usar un comando del bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le agregara el permiso')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('permiso')
            .setDescription('El permiso que se agregara')
            .setRequired(true)
            .addChoices(
                { name: 'AntecedentesPolicias', value: 'AntecedentesPolicias' },
                { name: 'Sanciones', value: 'Sanciones' },
                { name: 'ListarFacturas', value: 'ListarFacturas' },
                { name: 'SancionOrg', value: 'SancionOrg' },
                { name: 'ResumenSancionOrg', value: 'ResumenSancionOrg' }
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

            if (!validaEspecial) { return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true }) }

            const ValidarPermiso = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: user.id, CommandPermiso: permiso });

            if (ValidarPermiso) {
                return interation.reply({ content: 'El usuario ya tiene este permiso', ephemeral: true });
            }

            const permisos = new permisosCommand({
                guildServidor: interation.guild.id,
                guildUsuario: user.id,
                userName: user.username,
                guildAsignado: interation.user.id,
                userAsignado: interation.user.username,
                CommandPermiso: permiso
            });

            await permisos.save();
            return interation.reply({ content: `Se agrego el permiso para el usuario ${user.username}`, ephemeral: true });



        } catch (err) {
            console.log(err);
        }
    }
}
