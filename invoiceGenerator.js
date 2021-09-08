const { JSPDF } = require('jspdf')
const personalData = require('./assets/personalData.json')

const generatePDFInvoice = (USER_DATA) => {
  const doc = new JSPDF()

  /* Needs to be a base64 img */
  doc.addImage(personalData.logo, 'WEBP', 10, 8, 35, 8)

  /* Sender */
  doc.setFont('helvetica', 'bold')
  doc.text(personalData.name, 10, 30)
  doc.setFont('helvetica', 'normal')
  doc.text(personalData.adress, 10, 38)
  doc.text(personalData.postalCode, 10, 46)
  doc.text(personalData.nif, 10, 54)

  /* Destiny */
  doc.setFont('helvetica', 'bold')
  doc.text(USER_DATA.companyName, 200, 64, null, null, 'right')
  doc.setFont('helvetica', 'normal')
  doc.text(USER_DATA.companyAdress, 200, 72, null, null, 'right')
  doc.text(USER_DATA.companyID, 200, 80, null, null, 'right')

  /* Invoice number and Date */
  doc.text(
    `Factura número: ${USER_DATA.invoiceID}`,
    10,
    100,
    null,
    null,
    'left'
  )
  doc.text(formatDate(USER_DATA.date), 200, 100, null, null, 'right')

  /* Head Table */
  doc.setFont('helvetica', 'bold')
  doc.text('Descripción', 10, 120)
  doc.text('Horas', 140, 120)
  doc.text('Total', 200, 120, null, null, 'right')
  doc.setLineWidth(0.5)
  doc.line(10, 125, 200, 125)

  /* Tasks Table */
  doc.setFont('helvetica', 'normal')

  let tableHeightPosition = 120
  for (let index = 0; index < USER_DATA.tasks.length; index++) {
    tableHeightPosition += 15
    doc.text(USER_DATA.tasks[index].desciption, 10, tableHeightPosition, {
      maxWidth: 110,
    })
    doc.text(USER_DATA.tasks[index].hours.toString(), 150, tableHeightPosition)
    doc.text(
      `${parseInt(USER_DATA.tasks[index].hours) * USER_DATA.price} €`,
      200,
      tableHeightPosition,
      null,
      null,
      'right'
    )
  }

  doc.setFont('helvetica', 'bold')
  doc.text(`IVA: ${USER_DATA.iva}%`, 150, 230)
  doc.text(`IRPF: ${USER_DATA.irpf}%`, 150, 240)

  doc.setFont('helvetica', 'normal')
  doc.text(
    calculateVAT(USER_DATA).toString() + '€',
    200,
    230,
    null,
    null,
    'right'
  )
  doc.text(
    calculateIRPF(USER_DATA).toString() + '€',
    200,
    240,
    null,
    null,
    'right'
  )

  /* total */
  doc.line(10, 250, 200, 250)
  doc.setFont('helvetica', 'bold')
  doc.text('Cantidad total:', 10, 260)
  doc.text(finalResult(USER_DATA), 200, 260, null, null, 'right')

  /* Payment method */
  doc.setFont('helvetica', 'bold')
  doc.text('Forma de pago:', 10, 275)
  doc.setFont('helvetica', 'normal')
  doc.text('ingreso en cuenta bancaria', 10, 285)
  doc.text(personalData.bankAccount, 200, 285, null, null, 'right')

  /* Col */
  doc.save(`./invoices/invoice-${new Date().getTime()}.pdf`)
}

const calcTotal = (USER_DATA) => {
  return USER_DATA.tasks.reduce((acc, curr) => {
    acc += parseInt(curr.hours) * USER_DATA.price
    return acc
  }, 0)
}

const calculateVAT = (USER_DATA) => {
  return ((USER_DATA.iva / 100) * calcTotal(USER_DATA)).toFixed(2)
}

const calculateIRPF = (USER_DATA) => {
  return ((USER_DATA.irpf / 100) * calcTotal(USER_DATA)).toFixed(2)
}

const finalResult = (USER_DATA) => {
  return (
    calcTotal(USER_DATA) +
    parseInt(calculateVAT(USER_DATA)) -
    parseInt(calculateIRPF(USER_DATA)).toString() +
    '€'
  )
}

const formatDate = (value) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `Fecha: ${d}/${m}/${y}`
}

module.exports = generatePDFInvoice
