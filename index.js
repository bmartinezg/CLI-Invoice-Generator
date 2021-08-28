const inquirer = require('inquirer');
const { jsPDF } = require("jspdf"); // will automatically load the node version
inquirer.registerPrompt("date", require("inquirer-date-prompt"));

const companyQuestions = require('./src/questions/companyQuestions.json')
const tasksQuestions = require('./src/questions/tasksQuestions.json')
const taskTimeQuestion = require('./src/questions/taskTimeQuestion.json')
const personalData = require('./src/personalData.json')

let USER_DATA = {}

const initProgram = () => {
  inquirer.prompt(companyQuestions).then((data) => {
    USER_DATA = data
    generateTaskPrompt()
  })
}

const generateTaskPrompt = () => {
  const tasksPrompQuesitons = []

  for (let index = 0; index < USER_DATA.tasksAmount; index++) {
    tasksPrompQuesitons.push({
      name: `description-${index.toString()}`,
      message: `${tasksQuestions.message} ${index + 1}`
    })
    tasksPrompQuesitons.push({
      name: `hours-${index.toString()}`,
      message: `${taskTimeQuestion.message} ${index + 1}`
    })
  }

  inquirer.prompt(tasksPrompQuesitons).then((data) => {
    const hours = Object.keys(data)
    .filter(item => item.includes('hours'))
    .reduce((acc, curr) => {
      if (!curr) return
      acc.push({
        hours: data[curr]
      })
      return acc
  }, [])

  const desciptions = Object.keys(data)
    .filter(item => item.includes('description'))
    .reduce((acc, curr) => {
      if (!curr) return
      acc.push({
        desciption: data[curr]
      })
      return acc
  }, [])
  
  const tasks = hours.map((item, index) => {
    return {
      ...item,
      ...desciptions[index]
    }
  })

    USER_DATA = {
      ...USER_DATA,
      tasks
    }

    generatePDFInvoice()
  })
}

const generatePDFInvoice = () => {
  console.log(USER_DATA)
  const doc = new jsPDF();

  doc.addImage(personalData.logo, "WEBP", 10, 8, 35, 8);
  
  /* Snder */
  doc.setFont("helvetica", "bold");
  doc.text(personalData.name, 10, 30);
  doc.setFont("helvetica", "normal");
  doc.text(personalData.adress, 10, 38);
  doc.text(personalData.postalCode, 10, 46);
  doc.text(personalData.nif, 10, 54);

   /* Destiny */
  doc.setFont("helvetica", "bold");
  doc.text(USER_DATA.companyName, 200, 64, null, null, "right");
  doc.setFont("helvetica", "normal");
  doc.text(USER_DATA.companyAdress, 200, 72, null, null, "right");
  doc.text(USER_DATA.companyID, 200, 80, null, null, "right");

  /* Nº and Date */
  doc.text(`Factura número: ${USER_DATA.invoiceID}`, 10, 100, null, null, "left");
  doc.text(formatDate(USER_DATA.date), 200, 100, null, null, "right");

  /* Head Table */
  doc.setFont("helvetica", "bold");
  doc.text("Descripción", 10, 120, null, null);
  doc.text("Horas", 140, 120, null, null);
  doc.text("Total", 200, 120, null, null, "right");
  doc.setLineWidth(0.5);
  doc.line(10, 125, 200, 125);

  /* Table */
  doc.setFont("helvetica", "normal");

  let tableHeightPosition = 120
  for (let index = 0; index < USER_DATA.tasks.length; index++) {
    tableHeightPosition += 15
    doc.text(USER_DATA.tasks[index].desciption, 10, tableHeightPosition, {maxWidth: 110}, null);
    doc.text(USER_DATA.tasks[index].hours.toString(), 150, tableHeightPosition, null, null);
    doc.text(`${parseInt(USER_DATA.tasks[index].hours) * USER_DATA.price} €`, 200, tableHeightPosition, null, null, "right");
  }

  doc.setFont("helvetica", "bold");
  doc.text(`IVA: ${USER_DATA.iva}%`, 150, 230, null, null);
  doc.text(`IRPF: ${USER_DATA.irpf}%`, 150, 240, null, null);

  doc.setFont("helvetica", "normal");
  doc.text(calculateVAT().toString() + '€', 200, 230, null, null, 'right');
  doc.text(calculateIRPF().toString() + '€', 200, 240, null, null, 'right');

  /* total */
  doc.line(10, 250, 200, 250);
  doc.setFont("helvetica", "bold");
  doc.text("Cantidad total:", 10, 260, null, null);
  doc.text(finalResult(), 200, 260, null, null, 'right');

  /* Payment method */
  doc.setFont("helvetica", "bold");
  doc.text("Forma de pago:", 10, 275, null, null);
  doc.setFont("helvetica", "normal");
  doc.text("ingreso en cuenta bancaria", 10, 285, null, null);
  doc.text(personalData.bankAccount, 200, 285, null, null, 'right');

  /* Col */
  doc.save("INVOICE.pdf");
}

const calcTotal = () => {
  return USER_DATA.tasks.reduce((acc, curr) => {
    acc += parseInt(curr.hours) * USER_DATA.price
    return acc
  }, 0)
}

const calculateVAT = () => {
  return ((100 * USER_DATA.iva) / calcTotal()).toFixed(2);
}

const calculateIRPF = () => {
  return ((100 * USER_DATA.irpf) / calcTotal()).toFixed(2);
}

const finalResult = () => {
  console.log(calcTotal())
  return (calcTotal() + calculateVAT() - calculateIRPF()).toString() + '€'
}

const formatDate = (value) => {
  const date = new Date(value);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate()
  return `Fecha: ${d}/${m}/${y}`
}

initProgram()
