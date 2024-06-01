const {
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction    
} = require('discord.js');

const permisosSchema = require('../../Models/permisos');
const sancionesSchema = require('../../Models/sanciones');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitar-sancion')
        .setDescription('Quita una sancion a un usuario')
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le quitara la sancion')
            .setRequired(true)
        ).addRoleOption(option => option
            .setName('rol')
            .setDescription('El rol al que se le quitara')
            .setRequired(true)
        ),

    /**
  * @param {ChatInputCommandInteraction} interation
  * @param {Client} client 
  */

    async execute(interation, client) {
        try {
            const user = interation.options.getUser('user');
            const rol = interation.options.getRole('rol');

            const validarPermiso = await permisosSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });
            if (!validarPermiso) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const ValidarSancion = await sancionesSchema.findOne({ guildServidor: interation.guild.id, IdUsuarioSancionado: user.id, IdAviso: rol.id });

            if (ValidarSancion) {
                await sancionesSchema.findOneAndDelete({ guildServidor: interation.guild.id, IdUsuarioSancionado: user.id, IdAviso: rol.id });
                await interation.guild.members.cache.get(user.id).roles.remove(rol.id);
                return interation.reply({ content: `Se quito la sancion al usuario ${user.username} , con el rol ${rol}`, ephemeral: true });
            } else {
                return interation.reply({ content: 'El usuario no tiene una sancion con este rol', ephemeral: true });
            }

        } catch (err) {
            console.log(err);
        }
    }
}