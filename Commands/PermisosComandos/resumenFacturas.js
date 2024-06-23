const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder
} = require('discord.js');

const facturacionSchema = require('../../Models/facturacionUser');
const negociosSchema = require('../../Models/negocios');
const permisosCommand = require('../../Models/permisosCommand');
const { formatoMiles } = require('../../utils/formaMiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resumen-factura')
        .setDescription('Detalles de una factura')
        .addNumberOption(option =>
            option.setName('dias')
                .setDescription('Dias a consultar sobre la facturas')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        ),

    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client 
     */

    async execute(interation, client) {
        try {
            const { options } = interation;
            const dias = options.getNumber('dias');

            const obtenerAno = new Date().getFullYear();

            const validarPermisos = await permisosCommand.findOne({ guildServidor: interation.guild.id, guildUsuario: interation.user.id, CommandPermiso: 'ListarFacturas' });

            if (!validarPermisos) {
                return interation.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true });
            }

            const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

            const rolesArray = rolesUser.split(',')

            const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildRol: { $in: rolesArray } })

            if (validarRol.length === 0) {
                return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
            }

            if (validarRol.length === 1) {
                const rol = validarRol[0].guildRol;
                const guildNegocio = validarRol[0].guildNegocio

                const facturas = await facturacionSchema.aggregate([

                    {
                        $match: {   // Filtra por el rol seleccionado
                            guildRolEmpleo: rol,
                            fechaFacturacion: {
                                $gte: new Date(Date.now() - (dias * 24 * 60 * 60 * 1000)),
                                $lte: new Date(Date.now())
                            } // Filtra por los ultimos 30 dias
                        }
                    },
                    {
                        $group: {
                            _id: {
                                IdEmpleado: "$IdEmpleado",
                                NombreEmpleado: "$NombreEmpleado"
                            },
                            totalFacturado: { $sum: '$valorFactura' }, // Suma el valor de las facturas por empleado     
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            IdEmpleado: "$_id.IdEmpleado",
                            NombreEmpleado: "$_id.NombreEmpleado",
                            TotalFact: "$totalFacturado"
                        }
                    },
                    { $sort: { TotalFact: -1 } }

                ])

                if (facturas.length === 0) {
                    return interation.reply({ content: 'No hay facturas para mostrar', ephemeral: true })
                }

                const negocio = await negociosSchema.findOne({ guildNegocio: guildNegocio, guildRol: rol })
                const facturacionTotal = facturas.reduce((total, fact) => total + fact.TotalFact, 0)


                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle(`Facturas de ${negocio.nombreNegocio}`)
                for (let i = 0; i < facturas.length; i++) {
                    const fact = facturas[i]
                    embed.addFields({ name: `**Top ${i + 1}**`, value: `Nombre: ${fact.NombreEmpleado}\nFacturado: $ ${formatoMiles(fact.TotalFact)}` })
                }
                embed.addFields({ name: `**Total facturado**`, value: ` $ ${formatoMiles(facturacionTotal)}` })
                embed.setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                embed.setFooter({ text: `Palmera Vice | ${obtenerAno}` })

                await interation.reply({ content: `Detalle de la Facturas`, ephemeral: true })
                return interation.channel.send({ content: `**Detalles de las facturas de ${negocio.nombreNegocio} , de los ultimos ${dias} dias**`, embeds: [embed] })

            }

            const selecMenu = new StringSelectMenuBuilder()
                .setCustomId('selecMenunegocios')
                .setPlaceholder('Elige un negocio')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(validarRol.map(rol => {
                    return {
                        label: rol.nombreNegocio,
                        value: rol.guildRol
                    }
                }))

            const row = new ActionRowBuilder()
                .addComponents(selecMenu)


            const message = await interation.reply({ content: 'Selecciona el negocio donde quieres ver los detalles de la facturas', components: [row], ephemeral: true })

            const ifiter = i => i.user.id === interation.user.id

            const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })

            collectorFilter.on('collect', async i => {
                const facturas = await facturacionSchema.aggregate([
                    {
                        $match: {   // Filtra por el rol seleccionado
                            guildRolEmpleo: i.values[0],
                            fechaFacturacion: {
                                $gte: new Date(Date.now() - (dias * 24 * 60 * 60 * 1000)),
                                $lte: new Date(Date.now())
                            } // Filtra por los ultimos 30 dias
                        }
                    },
                    {
                        $group: {
                            _id: {
                                IdEmpleado: "$IdEmpleado",
                                NombreEmpleado: "$NombreEmpleado"
                            },
                            totalFacturado: { $sum: '$valorFactura' }, // Suma el valor de las facturas por empleado     
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            IdEmpleado: "$_id.IdEmpleado",
                            NombreEmpleado: "$_id.NombreEmpleado",
                            TotalFact: "$totalFacturado"
                        }
                    },
                    { $sort: { TotalFact: -1 } }

                ])
                if (facturas.length === 0) {
                    return interation.reply({ content: 'No hay facturas para mostrar', ephemeral: true })
                }

                const negocio = await negociosSchema.findOne({ guildNegocio: interation.guild.id, guildRol: i.values[0] })

                const facturacionTotal = facturas.reduce((total, fact) => total + fact.TotalFact, 0)

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle(`Facturas de ${negocio.nombreNegocio}`)
                for (let i = 0; i < facturas.length; i++) {
                    const fact = facturas[i]
                    embed.addFields({ name: `**Top ${i + 1}**`, value: `Nombre: ${fact.NombreEmpleado}\nFacturado: $ ${formatoMiles(fact.TotalFact)}` })
                }
                embed.addFields({ name: `**Total facturado**`, value: ` $ ${formatoMiles(facturacionTotal)}` })
                embed.setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                embed.setFooter({ text: `Palmera Vice | ${obtenerAno}` })

                await i.update({ content: `Detalle de la Facturas`, components: [] })
                return interation.channel.send({ content: `**Detalles de las facturas de ${negocio.nombreNegocio} , de los ultimos ${dias} dias**`, embeds: [embed] })

            })


        } catch (err) {
            console.log(err);
        }
    }
}