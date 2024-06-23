const { model , Schema } = require('mongoose');

const negociosSchema = new Schema({
    guildNegocio: String,
    guildRol : String,
    nombreNegocio: String
},{
    timestamps: true
})

module.exports = model('negocios', negociosSchema)