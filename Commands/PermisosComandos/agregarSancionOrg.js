const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');
const sancionesOrgSchema = require('../../Models/sancionesOrg');
const organizacionSchema = require('../../Models/organizacion');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-sancion-org')
        .setDescription('Agrega una sancion a una organizacion')
        .addRoleOption(option => option
            .setName('rol')
            .setDescription('El rol al que se le agregara la sancion')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('razon')
            .setDescription('La razon de la sancion')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('puntos')
            .setDescription('Los puntos de la sancion')
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
            const razon = options.getString('razon');
            const puntos = options.getNumber('puntos');

            const validarPermisos = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id, CommandPermiso: 'SancionOrg' });

            if (!validarPermisos) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const validarOrganizacion = await organizacionSchema.findOne({ guildServidor: interation.guild.id, guildOrganizacion: rol.id });

            if (!validarOrganizacion) {
                return interation.reply({ content: 'El rol no tiene una organizacion', ephemeral: true });
            }

            const sancionesOrg = new sancionesOrgSchema({
                guildServidor: interation.guild.id,
                orgSancionada: validarOrganizacion.nombreOrganizacion,
                idOrgSancionada: rol.id,
                razonSancion: razon,
                puntosSancion: puntos
            });

            await sancionesOrg.save();

            return interation.reply({ content: 'Se agrego la sancion', ephemeral: true });

        } catch (err) {
            console.log(err);
        }
    }
}