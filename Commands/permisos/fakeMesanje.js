const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder
} = require('discord.js');

const permisosCommand = require('../../Models/permisosCommand');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fake-messages')
        .setDescription('Envia un fake message')
        .addUserOption(option => option
            .setName('user')
            .setDescription('El usuario al que se le enviara el fake message')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('message')
            .setDescription('El fake message que se enviara')
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
            const message = options.getString('message');

            const validarPermisos = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id, CommandPermiso: 'FakeMessage' });

            if (!validarPermisos) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            await interation.channel.createWebhook({
                name: user.globalName,
                avatar: user.displayAvatarURL({ dynamic: true }),
            }).then((webhook) => {

                webhook.send({
                    content: message
                });

                setTimeout(() => {
                    webhook.delete();
                }, 3000)

            });

        } catch (error) {
            console.log(error);
        }
        return interation.reply({ content: 'Se envio el fake message', ephemeral: true });
    }
}