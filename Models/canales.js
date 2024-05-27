const { model , Schema } = require('mongoose');

const canalesSchema = new Schema({
    guildServidor: String,
    guildcanal: String,
    TipoCanal: String
},{
    timestamps: true
})

module.exports = model('config_canales', canalesSchema)