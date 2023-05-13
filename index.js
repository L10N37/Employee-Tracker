/*
npm i inquirer@8.2.4 
This version is used for compatibility with commonJS modules
*/

// Using 'figlet' for some ascii art, function draws ascii artwork application header
showAsciiArt('EMPLOYEE MANAGEMENT SYSTEM');

const mysql = require('mysql2');
const inquirer = require('inquirer');
const fs = require('fs');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  multipleStatements: true,
});

// make queries asynchronous
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

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

      // Populate the database with schema information
      populateDatabase();
    });
  });
}

// Function to populate the database with schema and seed data
function populateDatabase() {
  const schemaPath = './db/schema.sql';
  const seedPath = './db/seeds.sql';

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seeds = fs.readFileSync(seedPath, 'utf8');

  connection.query(schema, (err) => {
    if (err) throw err;

    console.log('Database schema created.');

    connection.query(seeds, (err) => {
      if (err) throw err;

      console.log('Database seeded with data.');

      // Start the command-line interface
      showMenu();
    });
  });
}

function showAsciiArt(value) {
  const figlet = require('figlet');

  figlet(value, function (err, data) {
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

// Functions: These are using the promisify to ensure that the function executions are paused until the query resuls are available. This also allows us to 'catch' errors.

// Function to view all departments
async function viewDepartments() {
  try {
    showAsciiArt('Viewing Departments');
    // Query the database to retrieve all departments
    const results = await queryAsync('SELECT * FROM department');

    console.log('ID | Name');
    results.forEach((department) => {
    console.log(`${department.id} | ${department.name}`);
    console.log('-----------------');
    });

    // Return to the main menu
    showMenu();
  } catch (err) {
    throw err;
  }
}

// Function to view all roles
async function viewRoles() {
  showAsciiArt('Viewing Roles');
  try {
    // Query the database to retrieve all roles
    const results = await queryAsync('SELECT * FROM role');

    console.log('ID | Title | Salary | Department ID');
    console.log('------------------------------------');
    results.forEach((role) => {
      console.log(`${role.id} | ${role.title} | ${role.salary} | ${role.departmentId}`);
    });

    // Return to the main menu
    showMenu();
  } catch (err) {
    throw err;
  }
}

// Function to view all employees
async function viewEmployees() {
  try {
    showAsciiArt('Viewing Employees')
    // Query the database to retrieve all employees
    const results = await queryAsync('SELECT * FROM employee');

    console.log('ID | First Name | Last Name | Role ID | Manager ID');
    console.log('---------------------------------------------------');
    results.forEach((employee) => {
      console.log(`${employee.id} | ${employee.firstName} | ${employee.lastName} | ${employee.roleId} | ${employee.managerId}`);
    });

    // Return to the main menu
    showMenu();
  } catch (err) {
    throw err;
  }
}
