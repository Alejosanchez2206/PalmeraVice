const { model, Schema } = require('mongoose');

const permisosSchema = new Schema({
    guildServidor: String,
    guildUsuario : String,
    userName : String,
    guildAsignado : String,
    userAsignado : String,
    CommandPermiso : String
},{
    timestamps: true
})

module.exports = model('CommandPermisos', permisosSchema)