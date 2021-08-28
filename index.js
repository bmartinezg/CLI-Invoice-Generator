const inquirer = require('inquirer');
inquirer.registerPrompt("date", require("inquirer-date-prompt"));

const companyQuestions = require('./assets/questions/companyQuestions.json')
const tasksQuestions = require('./assets/questions/tasksQuestions.json')
const taskTimeQuestion = require('./assets/questions/taskTimeQuestion.json')

const generatePDFInvoice = require('./invoiceGenerator')

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

    generatePDFInvoice(USER_DATA)
  })
}

initProgram()
