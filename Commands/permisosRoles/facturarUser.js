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
const { formatoMiles } = require('../../utils/formaMiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('facturar')
        .setDescription('Factura a un usuario')
        .addNumberOption(option =>
            option.setName('valor-factura')
                .setDescription('Dinero a facturar')
                .setRequired(true)
                .setMinValue(0)
        ).addStringOption(option =>
            option.setName('razon-factura')
                .setDescription('Razon de la factura')
                .setRequired(true)
                .setMinLength(3)
        ).addAttachmentOption(option =>
            option.setName('fotos')
                .setDescription('Captura de pantalla de la transacción')
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
            const valor = options.getNumber('valor-factura');
            const razon = options.getString('razon-factura');
            const fotos = options.getAttachment('fotos');

            const rolesUser = interation.member.roles.cache.map(role => role.id).join(',')

            const rolesArray = rolesUser.split(',')

            const validarRol = await negociosSchema.find({ guildNegocio: interation.guild.id, guildRol: { $in: rolesArray } })

            if (validarRol.length === 0) {
                return interation.reply({ content: 'No hay negocios asociados a tu usuario', ephemeral: true })
            }

            const obtenerAno = new Date().getFullYear();

            if (validarRol.length === 1) {
                const facturar = new facturacionSchema({
                    guildNegocio: validarRol[0].guildNegocio,
                    guildRolEmpleo: validarRol[0].guildRol,
                    NombreDelNegocio: validarRol[0].nombreNegocio,
                    NombreEmpleado: interation.user.username,
                    IdEmpleado: interation.user.id,
                    RazonFactura: razon,
                    valorFactura: valor,
                    fechaFacturacion: Date.now()
                })

                await facturar.save()

                const embebFact = new EmbedBuilder()
                    .setTitle('Facturacion Realizada')
                    .setDescription(`Detalles de la facturación`)
                    .setColor('Blue')
                    .addFields({ name: 'Valor', value: `$${formatoMiles(valor)}` })
                    .addFields({ name: 'Razon', value: razon })
                    .addFields({ name: 'Facturado por', value: interation.user.username })
                    .setImage(fotos.url)
                    .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                    .setFooter({ text: `Palmera Vice | ${obtenerAno}` })

                await interation.reply({ content: 'Factura realizada correctamente', ephemeral: true })

                return interation.channel.send({ embeds: [embebFact] })
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


            const message = await interation.reply({ content: 'Selecciona el negocio donde vas a realizar la facturación', components: [row], ephemeral: true })

            const ifiter = i => i.user.id === interation.user.id

            const collectorFilter = message.createMessageComponentCollector({ filter: ifiter, time: 30000 })

            collectorFilter.on('collect', async i => {
                if (i.customId === 'selecMenunegocios') {
                    const guildRol = i.values[0]

                    const negocios = await negociosSchema.findOne({ guildNegocio: interation.guild.id, guildRol: guildRol })

                    const facturar = new facturacionSchema({
                        guildNegocio: negocios.guildNegocio,
                        guildRolEmpleo: negocios.guildRol,
                        NombreDelNegocio: negocios.nombreNegocio,
                        NombreEmpleado: interation.user.username,
                        IdEmpleado: interation.user.id,
                        RazonFactura: razon,
                        valorFactura: valor,
                        fechaFacturacion: Date.now()
                    })

                    await facturar.save()

                    const embebFact = new EmbedBuilder()
                        .setTitle('Facturacion Realizada')
                        .setDescription(`Detalles de la facturación`)
                        .setColor('Blue')
                        .addFields({ name: 'Valor', value: `$${formatoMiles(valor)}` })
                        .addFields({ name: 'Razon', value: razon })
                        .addFields({ name: 'Facturado por', value: interation.user.username })
                        .setImage(fotos.url)
                        .setThumbnail(`https://images-ext-1.discordapp.net/external/amkx-RBT1tRCtsj9Ce_VsenmXLoKiBiosGKBDmQwUSY/https/i.ibb.co/F7cq51h/LOGOF.png?format=webp&quality=lossless`)
                        .setFooter({ text: `Palmera Vice | ${obtenerAno}` })

                    await i.update({ content: 'Factura realizada correctamente', components: [] })

                    return interation.channel.send({ embeds: [embebFact] })
                }

            })

        } catch (err) {
            console.log(err);
        }
    }
}

