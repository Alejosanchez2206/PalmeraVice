const { model , Schema } = require('mongoose');

const sancionesOrgSchema = new Schema({
    guildServidor: String,
    orgSancionada: String,
    idOrgSancionada: String,
    razonSancion: String,
    puntosSancion: Number,
},{
    timestamps: true
})

module.exports = model('sancionesOrgs', sancionesOrgSchema)