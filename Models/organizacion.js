const { model , Schema } = require('mongoose');

const organizacionSchema = new Schema({
    guildServidor: String,
    guildOrganizacion: String,
    nombreOrganizacion: String,    
},{
    timestamps: true
})

module.exports = model('organizaciones', organizacionSchema)