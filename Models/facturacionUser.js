const { model , Schema } = require('mongoose')

let facturacionSchema = new Schema({
    guildNegocio: String,
    guildRolEmpleo: String,
    NombreDelNegocio: String,
    NombreEmpleado: String,
    IdEmpleado : String,
    RazonFactura : String,
    valorFactura : Number,
    fechaFacturacion: Date,
}, {
    timestamps: true
})

module.exports = model('user_facturados', facturacionSchema)