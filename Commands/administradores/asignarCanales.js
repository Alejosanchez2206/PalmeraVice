const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');

const canalesSchema = require('../../Models/canales');
const permisosEspecialSchema = require('../../Models/permisosEspecial');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('asignar-canal')
        .setDescription('Configura un canal para el bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option
            .setName('canal')
            .setDescription('El canal al que se le asignara el bot')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ).addStringOption(option => option
            .setName('tipo')
            .setDescription('El tipo de canal al que se le asignara el bot')
            .setRequired(true)
            .addChoices(
                { name: 'anuncio', value: 'Anuncio' },
                { name: 'AvisarAntiRol', value: 'Avisar anti rol' },
                { name: 'AvisarantiSancion', value: 'Avisar en anti sancion' },
            )
        ),

    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const canal = options.getChannel('canal');
            const tipo = options.getString('tipo');
            const validaEspecial = await permisosEspecialSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });

            if (!validaEspecial) { return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true }) }

            const validarCanal = await canalesSchema.findOne({ guildServidor: interation.guild.id, TipoCanal: tipo });

            if (validarCanal) {
                await canalesSchema.findOneAndUpdate({ guildServidor: interation.guild.id, guildcanal: canal.id }, { guildServidor: interation.guild.id, guildcanal: canal.id, TipoCanal: tipo });
                return interation.reply({ content: 'Se actualizo el canal', ephemeral: true });
            }

            const canales = new canalesSchema({
                guildServidor: interation.guild.id,
                guildcanal: canal.id,
                TipoCanal: tipo
            });
            await canales.save();
            return interation.reply({ content: 'Se agrego el canal', ephemeral: true });

        } catch (err) {
            console.log(err);
        }
    }
}