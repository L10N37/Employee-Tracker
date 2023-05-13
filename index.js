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
          'Update an employee manager',
          'View employees by manager',
          'View employees by department',
          'View department budget',
          'Exit',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.option) {
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
        case 'Update an employee manager':
          updateEmployeeManager();
          break;
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'View employees by department':
          viewEmployeesByDepartment();
          break;
        case 'View department budget':
          viewDepartmentBudget();
          break;
        case 'Exit':
          console.log('Goodbye!');
          connection.end();
          break;
        default:
          console.log('Invalid option');
          showMenu();
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

// Functions: These are using the promisify to ensure that the function executions are paused until the query resuls are available. This also allows us to 'catch' errors.

//  function to view departments
async function viewDepartments() {
  showAsciiArt('Viewing Departments');
  try {
    // Query the database to retrieve all departments
    const results = await connection.promise().query('SELECT * FROM department');

    // Format the department data for table display
    const departments = results[0].map((department) => ({
      ID: department.id,
      Name: department.name,
    }));

    // Display the departments in a table format
    console.table(departments);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

//  function to view roles
async function viewRoles() {
  try {
    showAsciiArt('Viewing Job Roles');
    
    // Fetch all roles from the database
    const roles = await connection.promise().query('SELECT * FROM role');

    // Display the roles in a table format
    console.table(roles[0]);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// function to view employees
async function viewEmployees() {
  try {
    showAsciiArt('Viewing Employees');

    // Query the database to retrieve all employees with additional information
    const query = `
      SELECT
        employee.firstName,
        employee.lastName,
        role.title AS jobRole,
        department.name AS departmentName,
        role.salary,
        CONCAT(manager.firstName, ' ', manager.lastName) AS manager
      FROM
        employee
      INNER JOIN role ON employee.roleId = role.id
      INNER JOIN department ON role.departmentId = department.id
      LEFT JOIN employee manager ON employee.managerId = manager.id
    `;
    const results = await queryAsync(query);

    // Display the employees in a table format
    console.table(results);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// function to add deparment/s
async function addDepartment() {
  try {
    showAsciiArt('Adding New Department');
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
        validate: (input) => {
          if (input.trim() === '') {
            return 'Please enter a department name.';
          }
          return true;
        },
      },
    ]);

    const departmentName = answers.departmentName;

    // Insert the new department into the database
    await connection.promise().query('INSERT INTO department SET ?', { name: departmentName });

    console.log(`Department '${departmentName}' added successfully.`);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// function to add roles
  async function addRole() {
    try {
      showAsciiArt('Adding Job Role');
  
      // Fetch the list of departments
      const departments = await connection.promise().query('SELECT * FROM department');
      const departmentChoices = departments[0].map((department) => ({
        name: department.name,
        value: department.id,
      }));
  
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'roleTitle',
          message: 'Enter the title of the role:',
          validate: (input) => {
            if (input.trim() === '') {
              return 'Please enter a role title.';
            }
            return true;
          },
        },
        {
          type: 'number',
          name: 'roleSalary',
          message: 'Enter the salary for the role:',
          validate: (input) => {
            if (isNaN(input) || input <= 0) {
              return 'Please enter a valid salary.';
            }
            return true;
          },
        },
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select the department for the role:',
          choices: departmentChoices,
        },
      ]);
  
      const roleTitle = answers.roleTitle;
      const roleSalary = answers.roleSalary;
      const departmentId = answers.departmentId;
  
      // Insert the new role into the database
      await connection.promise().query('INSERT INTO role SET ?', {
        title: roleTitle,
        salary: roleSalary,
        departmentId: departmentId,
      });
  
      console.log(`Role '${roleTitle}' added successfully.`);
  
      // Return to the main menu
      showMenu();
    } catch (err) {
      console.error(err);
    }
  }
  
// function to add employee/s
async function addEmployee() {
  try {
    showAsciiArt('Adding Employee');

    // Prompt the user for employee details
    const employeeData = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Enter the employee's first name:",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Enter the employee's last name:",
      },
      {
        type: 'list',
        name: 'roleId',
        message: "Select the employee's role:",
        choices: async () => {
          const roles = await queryAsync('SELECT id, title FROM role');
          return roles.map(role => ({
            name: role.title,
            value: role.id
          }));
        }
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Select the employee's manager:",
        choices: async () => {
          const employees = await queryAsync('SELECT id, CONCAT(firstName, " ", lastName) AS name FROM employee');
          return employees.map(employee => ({
            name: employee.name,
            value: employee.id
          }));
        }
      }
    ]);

    // Insert the employee data into the database
    await queryAsync('INSERT INTO employee SET ?', employeeData);
    console.log('Employee added successfully.');

    // Return to the main menu
    showMenu();
  } catch (err) {
    throw err;
  }
}

// function to update employee role
async function updateEmployeeRole() {
  try {
    showAsciiArt('Updating Employee Role');

    // Fetch the list of employees
    const employees = await connection.promise().query('SELECT * FROM employee');
    const employeeChoices = employees[0].map((employee) => ({
      name: `${employee.firstName} ${employee.lastName}`,
      value: employee.id,
    }));

    // Fetch the list of roles
    const roles = await connection.promise().query('SELECT * FROM role');
    const roleChoices = roles[0].map((role) => ({
      name: role.title,
      value: role.id,
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices,
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the new role:',
        choices: roleChoices,
      },
    ]);

    const employeeId = answers.employeeId;
    const roleId = answers.roleId;

    // Update the employee's role in the database
    await connection.promise().query('UPDATE employee SET roleId = ? WHERE id = ?', [roleId, employeeId]);

    console.log(`Employee with ID '${employeeId}' role updated successfully.`);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

async function updateEmployeeManager() {
  try {
    showAsciiArt('Updating Employee Manager');

    // Fetch the list of employees
    const employees = await connection.promise().query('SELECT id, firstName, lastName FROM employee');
    const employeeChoices = employees[0].map((employee) => ({
      name: `${employee.firstName} ${employee.lastName}`,
      value: employee.id,
    }));

    // Prompt for the employee to update
    const employeeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices,
      },
    ]);
    const employeeId = employeeAnswer.employeeId;

    // Fetch the list of managers
    const managers = await connection.promise().query('SELECT id, firstName, lastName FROM employee WHERE id <> ?', [employeeId]);
    const managerChoices = managers[0].map((manager) => ({
      name: `${manager.firstName} ${manager.lastName}`,
      value: manager.id,
    }));

    // Prompt for the new manager
    const managerAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the new manager:',
        choices: managerChoices,
      },
    ]);
    const managerId = managerAnswer.managerId;

    // Update the employee's manager in the database
    await connection.promise().query('UPDATE employee SET managerId = ? WHERE id = ?', [managerId, employeeId]);

    console.log('Employee manager updated successfully.');

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}
