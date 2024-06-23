const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const permisosEspecialSchema = require('../../Models/permisosEspecial');
const organizacionSchema = require('../../Models/organizacion');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-organizacion')
        .setDescription('Crea una organizacion')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
            .setName('nombre')
            .setDescription('El nombre de la organizacion')
            .setRequired(true)
        ).addRoleOption(option => option
            .setName('rol')
            .setDescription('El rol de la organizacion')
            .setRequired(true)
        ),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const rol = options.getRole('rol');
            const nombre = options.getString('nombre');

            const validarPermiso = await permisosEspecialSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });

            if (!validarPermiso) { return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true }); }

            const ValidarOrganizacion = await organizacionSchema.findOne({ guildServidor: interation.guild.id, guildOrganizacion: rol.id });

            if (ValidarOrganizacion) {
                return interation.reply({ content: 'El rol ya tiene una organizacion', ephemeral: true });
            }

            const organizacion = new organizacionSchema({
                guildServidor: interation.guild.id,
                guildOrganizacion: rol.id,
                nombreOrganizacion: nombre
            });

            await organizacion.save();

            return interation.reply({ content: 'Se agrego la organizacion', ephemeral: true });

        } catch (err) {
            console.log(err);
        }
    }
}