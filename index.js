const inquirer = require('inquirer');
inquirer.registerPrompt("date", require("inquirer-date-prompt"));

const companyQuestions = require('./src/questions/companyQuestions.json')
const tasksQuestions = require('./src/questions/tasksQuestions.json')


let userData = {}

const initProgram = () => {
  inquirer.prompt(companyQuestions).then((data) => {
    userData = data
    generateTaskPrompt()
  })
}

const generateTaskPrompt = () => {
  const tasksPrompQuesitons = []

  for (let index = 0; index < userData.tasksAmount; index++) {
    tasksPrompQuesitons.push({
      name: index.toString(),
      message: `${tasksQuestions.message} ${index + 1}`
    })
  }
  inquirer.prompt(tasksPrompQuesitons).then((data) => {
    userData = {
      ...userData,
      tasks: Object.entries(data).map((e) => ( { 'description': e[1] } ))
    }
    console.log(userData)
  })
}


initProgram()