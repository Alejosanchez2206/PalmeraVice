const { model , Schema } = require('mongoose');

const antecedentesSchema = new Schema({
    guildServidor: String,
    UsurioSancionado: String,
    IdUsuarioSancionado: String,
    Oficial: String,
    IdOficial: String,
    Cargo : String,
    UrlImagen: String
},{
    timestamps: true
})

module.exports = model('antecedentes', antecedentesSchema)