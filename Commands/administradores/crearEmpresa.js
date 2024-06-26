const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType
} = require('discord.js');


const permisosEspecialSchema = require('../../Models/permisosEspecial');
const negociosSchema = require('../../Models/negocios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-empresa')
        .setDescription('Crea una empresa')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
            .setName('nombre')
            .setDescription('El nombre de la empresa')
            .setRequired(true)
        ).addRoleOption(option => option
            .setName('rol')
            .setDescription('El rol de la empresa')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('crear-categoria')
            .setDescription('Desea crear una categoria para el negocio')
            .addChoices(
                { name: 'Si', value: 'Si' },
                { name: 'No', value: 'No' },
            )
        ),
    /**
    * @param {ChatInputCommandInteraction} interation
    * @param {Client} client 
    */
    async execute(interation, client) {
        try {
            const { options } = interation;
            const name = options.getString('nombre');
            const role = options.getRole('rol');
            const category = options.getString('crear-categoria');
            
            const validarEspecial = await permisosEspecialSchema.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id });

            if (!validarEspecial) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }


            if (category === 'Si') {
                const categoria = await interation.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: interation.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })

                const canales = ['ɪɴꜰᴏ', 'ᴘʀᴇᴄɪᴏꜱ', 'ᴇᴍᴘʟᴇᴀᴅᴏꜱ'];

                canales.forEach(async canal => {
                    if (canal === 'ᴇᴍᴘʟᴇᴀᴅᴏꜱ') {
                        await interation.guild.channels.create({
                            name: canal,
                            type: ChannelType.GuildText,
                            parent: categoria.id,
                            permissionOverwrites: [
                                {
                                    id: interation.guild.id,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: role.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                }
                            ]
                        })
                    } else {
                        await interation.guild.channels.create({
                            name: canal,
                            type: ChannelType.GuildText,
                            parent: categoria.id,
                            permissionOverwrites: [
                                {
                                    id: interation.guild.id,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: role.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                }, {
                                    id: '1078136945751883916',
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                }
                            ]
                        })
                    }

                })
                await interation.guild.channels.create({
                    name: 'ᴇᴍᴘʀᴇꜱᴀ ᴠᴄ',
                    type: ChannelType.GuildVoice,
                    parent: categoria.id,
                    permissionOverwrites: [
                        {
                            id: interation.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }, {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                        }, {
                            id: '1078136945751883916',
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]

                        }
                    ]
                })
            }

            const empresa = new negociosSchema({
                guildNegocio: interation.guild.id,
                nombreNegocio: name,
                guildRol: role.id
            });
            await empresa.save();

            return interation.reply({ content: 'Se ha creado la empresa', ephemeral: true });


        } catch (err) {
            console.log(err);
        }

    }
}