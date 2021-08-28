const inquirer = require('inquirer');
const { jsPDF } = require("jspdf"); // will automatically load the node version
inquirer.registerPrompt("date", require("inquirer-date-prompt"));

const companyQuestions = require('./src/questions/companyQuestions.json')
const tasksQuestions = require('./src/questions/tasksQuestions.json')
const taskTimeQuestion = require('./src/questions/taskTimeQuestion.json')

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

  doc.addImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAAA6CAIAAADwTxiaAAAACXBIWXMAAAsSAAALEgHS3X78AAAKYUlEQVR4nO1dXW6bTBcm7auqqSqBo6i5iCrICiArAK/AzgrAKzBdgfEKTC56jVlB8AqwV2C8AuPLSlGAqkoqVWo/Keh188U2PmeYH+K8z0UuovHMcOaZM+ecOTNztFwu0zSVqMKyLLoVNgFJkuR5DumIYRiKogC7nD6CuNo8z5Mkodul5mBTOHSpdTQYDIbDIfXvlWXZsqzuI8jk7rouZFwh0DTNMAzLsgzDIK7EsqzZbAYpGccxfJA8zwPKf2u1aZpeXFzs/e1gMPA8D9glgZj+izRNV6vVro6Ypmk8gphdf+XC9GNlWR4MBlmW/UHCNE0WnbFtez6fYzuD6k8cx/Bq4fLfVW2/34f8fLlcEnw1H8RxbNu2LMtAUTyFrutBEBAQ7M+fP8zZX0JVVRQnGLF/DdM0sXOgsezPsgzCG9u2Ud/LB0EQqKoKlEAFSr2GneFv6jcMwWq1arfb4/GYT3N7MZvNLi8vX4QxsBeKoriuu7dYGIbUHbw6iKJI07Rer1dh4cBRFEUYhhcXF57nAd0zSZI4sb9Er9drzgSQJGk4HBqGARdWY+G6LkT9O47ThC/I87zb7V5dXVHh/TMMh0NN06IoghTmyv5yAkynU86NVmCxWFiW9dInAFD9z2Yz4cKfTqeapk0mE3ZNFEVxdXUFEQhv9kuS1O12G8W2w5gAnudBDGixxt54PG6320VRcGjr+vp678IugP1FUTTN4F4sFgfgA0A+YTabiTI+Hcfp9Xo8W9yr1wSwv5yXjfLAyi41yiQjgOM4jVX/juOEYci/3eoJIIb95SIoquldaIhTWAe+7+/99Wq14iz88XgshPolKibAf+z/C/60oI5utwvZl3Bdl5ufM51OORs8m1gsFltVmzD2r1arphk/QN3ZcEAMm6Io+HxpGdxsgsAmk8mmZP6B/962bU3TKgqkaYpa4JIkqa6QPxaLRZqmTesVCpZlmaa5NyXJ933XdVmnvjmOUzPCc3x8/OnTJ0mSvn//nmVZnaqGw2G3232a64Vgv+M4e5O3XNe9vLwEVpgkCRXFEMfx1v+XyVJRFKEGIIoiSKi4yfA8r91uV3ewKArXdZlaelEUkcX1W63W27dvb29vJUl6eHh4tinWarXevXv37ds3gppd1/2/2Eb9PJNnACZdlU1X1APPq6nuT5ZlnU4HWJUkSZ1Op2Z/OOf5bIVt25A6maa+ESTwyLJ8fHwMLHx2doatX5KkIAjWPaRv9zfEzltDUZQoiuATgFZatVgAw5rsop/j8RibyCDLclEUDw8PwPKl+sdmhj79ZGFeL2eMx2OgmFgkn/CHpmkQ9R+GIaNdDtS8KvU9mYdQFMXJyQm8/Gq1WmcB0Wc/PJTG8wiYoihNW5RYQ6D6n06ncCVyfHwM1/dbcXd3h5oAa2+HPvvhobQ6J60IwLk54dA0DeJUsEh9QznTR0dH9Vu8u7t7//49sPBkMimj7TTZn+e54zjA43+dTofzSdMXHcckg6jMZ2CCsSRJp6en9/f3VBp98wZB5rKHiB+02+2jSrRaLXi8n78d8tLTeAgAzHymu8mdJAncgi/DmlRwf38PjwKVZBDj9ZqmyT+pBqiQyE6XNhZA9Y86ElUNuOInC1lWAL4JIIz9sizzTyjwfR/ohx2Ye6AoCsSvXa1WtAYFHjIm27GqRqvVghQriiJJEgHs932fM8PG4/GXL1+AhQ/vMiLXdSEbT77vU1H/wPQt+K4WCh8/foT3kyv7ZVkOgoCbzZPneRRFlmWhcgwPMjDKM/VtsVhAip2entZvaxNwR4K37i+vlKJe7S5PvNVqXV1dAWNQJVRVPcjAKPDgy3A45JZ4iwrRwIHaOuDK/tlsZhhGk3PoD+CAyy4A9XrNzS94YO3nz591GqoPAXZ/URS9Xq+ZJJNl+aVnd1YAePAlDEM+mU4sXF4U8jwXE/EMw7CBE4BDvrtYAPX6AauAZxCW5RaGYaOkrKrqYVztVoHy4MveYnyu/WEU80FBZI7n9fU1fGeENZrTE6YAWv/EigkeMyhPbAmEZVmCM5wbov6DIHglOXCGYUAynxeLBVlwAm46/v79m6B+uhDM/iZco8BzC6IJYJ35DDzS9ePHDxbCOD8/B5bUNA3BfuDJuvl8jjpJKPYahddGffjBF+LcB2Aubc0j6rsAzxjFsR8IwzCiKAKeKy0XWSF3aKqqOp/PXxv1S3iexy71Db6hySKhED6pGNr9vu/Dv43zUdryOZk0TV/beZc1NE2DeFxkuQ9wqVLf7oUnjZaxL1bsR50k5Jx5b1nWwQc39wKY+ez7Pjb3Aa77ga/OwAHfQSvJydDr5XaWavAIuBwnk8kriW9WAHjwheDCbUVR4I7fr1+/UJVXAJU2x5z93OD9C3iDjuNgLVpGk1nguwFA9U/w5BF82b+/v6eS7HlycgLP7tR1vRxNhuznfE2n67q6rgMLF0WB9Xfh7EctLAJXIUVRgGY9VlaO48CX4tvbW9SNDJs4OTm5u7uDl/+76DG6Swxl0t3c3GzWQHCX264rDXdhNBrBvwguKFmWgQ9Coh7MZHTvGjA8j31yE/sWKLEDgJ05qqquO8mK/fCIpyRJW7lCdpMh/B7FUuJwSqGmlq7reydAEASorsKFjwKwG6Zpoqol82hRVpAsyx8+fMA28fQmQ/rsx+527bqIk4z9WKHDBxW7O1PGVbfOrjiOsa8R77pdlAqA6n/rEl2B0WiE+sY1Pn/+XF3g9PSULElO1/Wn/eX0WnUF6t8a++yHNzc3qA7A7R+4X/EUuq7btl0GpjqdDtnjzCgjDQvgsvbUZmAqsTXOzs5UVT0/P1//rVPbpgYXz/5d41rnDmeUZoXbPyhbhS7IXuKHAyixp2YDBPP5XJTENtHv9591WTz7d41rHfYvl0tUH4D2D/XdGSBs26ZM9g0A1b8sy9h5SGz/0MUzm6eEYPZXjGvN+/ux3wU0LYSIi+kt+2sABV796sJWoEIgLLBr0opkf7XJUf/1CpSZCLd/atqyWBCwjQxAK4VA/YudABUBaJHsZ/12Czb8v3Vx3MR8Pudm/2DjjDUB5CiZJSZkAlTvvQhj/95xpfJyETb2ClS02LASGXRdZ+3sPgPcXyIzxjhPAF3Xq/sphv2QcaXCfgI/FbhNyzr+w5/6JZiqf55xs06ns1eAAthfHivZKyZar9ZhYw5A+4epCQQZOUaA6wts7sNTuTH1nWRZBsYweLPfNE3guNJiP4GfCnc0sQ9C7gV85NgBSImaPsloNGKhO2zbhisOfuwvd/7h0qHIfoI9F5RdS5C5sBWokWMHDuq/RJZlqIMZe6WH9UZ4sF+W5X6/j+0ZRfZjs9/IxjWOY9u2CcZSVdVdGUGiAGQFQe7DVgRBQLyEqqo6Go3IpMeQ/WV+CzY1ag267M+yDBX+r6PV4jgeDAamaVbMBF3XO53OaDQCOtmcARfX169faXUty7Kbm5t+v7936NfSq6kyjpbLJfVjKNojalaSJAnw3BPwIGn6CGDrhmHQutPzWbsUa2YKoLgURWF0OUCe55vXHVChVglJkv4Ho1ducvead90AAAAASUVORK5CYII=", "WEBP", 10, 8, 35, 8);
  
  /* Snder */
  doc.setFont("helvetica", "bold");
  doc.text("Bruno Martínez González", 10, 30);
  doc.setFont("helvetica", "normal");
  doc.text("C/Geranios Nº6 2B", 10, 38);
  doc.text("28029, Madrid", 10, 46);
  doc.text("NIF: 45575017B", 10, 54);

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
  doc.text("ES7338399393939393", 200, 285, null, null, 'right');

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
