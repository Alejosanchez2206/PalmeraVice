const { model, Schema } = require('mongoose');

const sancionesSchema = new Schema({    
    guildServidor: String,
    UsuarioSancionado: String,
    IdUsuarioSancionado: String,
    DetaillUser : Object,
    Admin: String,
    IdAdmin: String,
    DetaillAdmin : Object,
    Razon: String,
    Reportes: Number,
    Aviso: String,
    IdAviso: String,
    DetaillAviso : Object,
    Observaciones: String
},{
    timestamps: true
})

module.exports = model('sanciones', sancionesSchema)