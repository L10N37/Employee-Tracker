/*
npm i inquirer@8.2.4 
This version is used for compatibility with commonJS modules
*/
showAsciiArtHeader();
const mysql = require('mysql2');
const inquirer = require('inquirer');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server.');

  // Create the employeedatabase if it doesn't exist
  createDatabase();
});

// Function to create the employeedatabase if it doesn't exist
function createDatabase() {
  connection.query('CREATE DATABASE IF NOT EXISTS employeedatabase', (err) => {
    if (err) throw err;
    console.log('employeedatabase created or already exists.');

    // Connect to the employeedatabase
    connection.changeUser({ database: 'employeedatabase' }, (err) => {
      if (err) throw err;
      console.log('Connected to employeedatabase.');

      // Start the command-line interface
      showMenu();
    });
  });
}

function showAsciiArtHeader() {
  const figlet = require('figlet');

  figlet('EMPLOYEE MANAGEMENT SYSTEM', function (err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });
}

// Show the main menu options
function showMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'Select an option:',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.option) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          console.log('Goodbye!');
          break;
        default:
          console.log('Invalid option. Please try again.');
          showMenu();
      }
    });
}
