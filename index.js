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
async function createDatabase() {
  await new Promise((resolve, reject) => {
    connection.query('CREATE DATABASE IF NOT EXISTS employeedatabase', (err) => {
      if (err) reject(err);
      console.log('employeedatabase created or already exists.');
      resolve();
    });
  });

  // Connect to the employeedatabase
  await new Promise((resolve, reject) => {
    connection.changeUser({ database: 'employeedatabase' }, (err) => {
      if (err) reject(err);
      console.log('Connected to employeedatabase.');
      resolve();
    });
  });

  // Populate the database with schema information
  await populateDatabase();
}

// Function to populate the database with schema and seed data
async function populateDatabase() {
  const schemaPath = './db/schema.sql';
  const seedPath = './db/seeds.sql';

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seeds = fs.readFileSync(seedPath, 'utf8');

  await new Promise((resolve, reject) => {
    connection.query(schema, (err) => {
      if (err) reject(err);
      console.log('Database schema created.');
      resolve();
    });
  });

  await new Promise((resolve, reject) => {
    connection.query(seeds, (err) => {
      if (err) reject(err);
      console.log('Database seeded with data.');
      resolve();
    });
  });

  // Start the command-line interface
  showMenu();
}


function showAsciiArt(value) {
  const figlet = require('figlet');

  figlet(value, { font: 'Standard' }, function (err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }

    let coloredArt = '';
    for (let i = 0; i < data.length; i++) {
      const randomColorCode = Math.floor(Math.random() * 7) + 31; // Generate random color code between 31 and 37
      coloredArt += `\x1b[1m\x1b[${randomColorCode}m${data[i]}\x1b[0m`; // Set random color and bold style for each character
    }

    console.log(coloredArt);
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
          'Delete',
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
        case 'Delete':
        deleteMenu();
        break;
        case 'Exit':
          console.log('Goodbye!');
          connection.end();
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

// this function displays a new inquirer prompt, it's nested, this gives the option of what you want to delete
// it minimises the original prompt list which is already a little too long by nesting the new delete options here instead of the main choices list
// should probably nest the 'View By' options too
function deleteMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'deleteOption',
        message: 'Select an option to delete:',
        choices: ['Delete a department', 'Delete a role', 'Delete an employee', 'Go back'],
      },
    ])
    .then((answer) => {
      switch (answer.deleteOption) {
        case 'Delete a department':
          deleteDepartment();
          break;
        case 'Delete a role':
          deleteRole();
          break;
        case 'Delete an employee':
          deleteEmployee();
          break;
        case 'Go back':
          showMenu();
          break;
      }
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

    const query = `
      SELECT
        employee.firstName,
        employee.lastName,
        IFNULL(role.title, 'Not assigned') AS jobRole,
        IFNULL(department.name, 'Not assigned') AS departmentName,
        IFNULL(role.salary, 'Not assigned') AS salary,
        IFNULL(CONCAT(manager.firstName, ' ', manager.lastName), 'Not assigned') AS manager
      FROM
        employee
      LEFT JOIN role ON employee.roleId = role.id
      LEFT JOIN department ON role.departmentId = department.id
      LEFT JOIN employee manager ON employee.managerId = manager.id
    `;
    const results = await queryAsync(query);

    console.table(results);

    console.log(); // Add a blank line

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

// update employee manager function
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

// view employees by manager function
async function viewEmployeesByManager() {
  try {
    showAsciiArt('Viewing Employees by Manager');

    // Fetch the list of managers
    const managers = await connection.promise().query('SELECT DISTINCT CONCAT(firstName, " ", lastName) AS manager FROM employee WHERE managerId IS NULL');

    // Prompt the user to select a manager
    const managerChoices = managers[0].map(manager => manager.manager);
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: 'Select a manager:',
        choices: managerChoices,
      },
    ]);

    const selectedManager = answers.manager;

    // Query the database to retrieve employees managed by the selected manager
    const query = `
      SELECT
        e.id,
        e.firstName,
        e.lastName,
        r.title AS jobRole,
        d.name AS departmentName,
        r.salary
      FROM
        employee e
      INNER JOIN role r ON e.roleId = r.id
      INNER JOIN department d ON r.departmentId = d.id
      INNER JOIN employee m ON e.managerId = m.id
      WHERE
        CONCAT(m.firstName, ' ', m.lastName) = ?
      ORDER BY
        e.id
    `;
    const results = await connection.promise().query(query, [selectedManager]);

    // Display the employee information using console.table
    console.table(results[0]);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// view employee by department function
async function viewEmployeesByDepartment() {
  try {
    showAsciiArt('Viewing Employees by Department');

    // Fetch the list of departments
    const departments = await connection.promise().query('SELECT * FROM department');

    // Prompt the user to select a department
    const departmentChoices = departments[0].map((department) => ({
      name: department.name,
      value: department.id,
    }));
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select a department:',
        choices: departmentChoices,
      },
    ]);

    const selectedDepartmentId = answers.departmentId;

    // Query the database to retrieve employees in the selected department
    const query = `
      SELECT
        e.id,
        e.firstName,
        e.lastName,
        r.title AS jobRole,
        d.name AS departmentName,
        r.salary
      FROM
        employee e
      INNER JOIN role r ON e.roleId = r.id
      INNER JOIN department d ON r.departmentId = d.id
      WHERE
        d.id = ?
      ORDER BY
        e.id
    `;
    const results = await connection.promise().query(query, [selectedDepartmentId]);

    // Display the employee information using console.table
    console.table(results[0]);

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// delete department function
async function deleteDepartment() {
  try {
    // Retrieve the list of departments from the database
    const query = 'SELECT id, name FROM department';
    const departments = await new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) {
          console.error('Error retrieving departments:', err);
          reject(err);
        } else {
          const departmentList = res.map((department) => ({
            name: `${department.name} (ID: ${department.id})`,
            value: department.id,
          }));
          resolve(departmentList);
        }
      });
    });

    // Prompt for the department ID you want to delete
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department you want to delete:',
        choices: departments,
      },
    ]);

    const departmentId = answer.departmentId;

    // Delete the department from the database
    const deleteQuery = 'DELETE FROM department WHERE id = ?';
    await new Promise((resolve, reject) => {
      connection.query(deleteQuery, [departmentId], (err, res) => {
        if (err) {
          console.error('Error deleting department:', err);
          reject(err);
        } else {
          console.log('Department deleted successfully!');
          resolve();
        }
      });
    });
  } catch (err) {
    console.error(err);
  }

  showMenu();
}

// delete role function
async function deleteRole() {
  try {
    // Retrieve the list of roles from the database
    const query = 'SELECT id, title FROM role';
    const roles = await new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) {
          console.error('Error retrieving roles:', err);
          reject(err);
        } else {
          const roleList = res.map((role) => ({
            name: `${role.title} (ID: ${role.id})`,
            value: role.id,
          }));
          resolve(roleList);
        }
      });
    });

    // Prompt for the role ID you want to delete
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role you want to delete:',
        choices: roles,
      },
    ]);

    const roleId = answer.roleId;

    // Check if there are any employees assigned to the role being deleted
    const checkQuery = 'SELECT COUNT(*) AS count FROM employee WHERE roleId = ?';
    const result = await new Promise((resolve, reject) => {
      connection.query(checkQuery, [roleId], (err, res) => {
        if (err) {
          console.error('Error checking employees:', err);
          reject(err);
        } else {
          const count = res[0].count;
          resolve(count);
        }
      });
    });

    if (result > 0) {
      console.log('Cannot delete the role. There are employees assigned to this role.');
    } else {
      // Delete the role from the database
      const deleteQuery = 'DELETE FROM role WHERE id = ?';
      await new Promise((resolve, reject) => {
        connection.query(deleteQuery, [roleId], (err, res) => {
          if (err) {
            console.error('Error deleting role:', err);
            reject(err);
          } else {
            console.log('Role deleted successfully!');
            resolve();
          }
        });
      });
    }
  } catch (err) {
    console.error(err);
  }

  showMenu();
}

// delete employee function
async function deleteEmployee() {
  try {
    // Fetch the list of employees
    const employees = await connection.promise().query('SELECT * FROM employee');

    // Prompt the user to select an employee to delete
    const employeeChoices = employees[0].map((employee) => ({
      name: `${employee.firstName} ${employee.lastName}`,
      value: employee.id,
    }));
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to delete:',
        choices: employeeChoices,
      },
      {
        type: 'confirm',
        name: 'confirmDelete',
        message: 'Are you sure you want to delete this employee?',
        default: false,
      },
    ]);

    if (answer.confirmDelete) {
      const employeeId = answer.employeeId;

      // Delete the employee from the database
      await connection.promise().query('DELETE FROM employee WHERE id = ?', [employeeId]);

      console.log('Employee deleted successfully.');
    } else {
      console.log('Employee deletion canceled.');
    }

    // Return to the main menu
    showMenu();
  } catch (err) {
    console.error(err);
  }
}

// view department budget function
async function viewDepartmentBudget() {
  try {
    // Retrieve the list of departments from the database
    const query = 'SELECT id, name FROM department';
    const departments = await new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) {
          console.error('Error retrieving departments:', err);
          reject(err);
        } else {
          const departmentList = res.map((department) => ({
            name: `${department.name} (ID: ${department.id})`,
            value: department.id,
          }));
          resolve(departmentList);
        }
      });
    });

    // Prompt for the department ID to view the budget
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department to view the budget:',
        choices: departments,
      },
    ]);

    const departmentId = answer.departmentId;

    // Calculate the department budget
    const budgetQuery =
      'SELECT SUM(r.salary) AS departmentBudget FROM employee e INNER JOIN role r ON e.roleId = r.id WHERE r.departmentId = ?';
    const result = await new Promise((resolve, reject) => {
      connection.query(budgetQuery, [departmentId], (err, res) => {
        if (err) {
          console.error('Error calculating department budget:', err);
          reject(err);
        } else {
          const departmentBudget = res[0].departmentBudget;
          resolve(departmentBudget);
        }
      });
    });

    console.log(`\n\x1b[36m\x1b[1mDepartment Budget:\x1b[0m \x1b[35m\x1b[4m$${result}\x1b[0m\n`);
  } catch (err) {
    console.error(err);
  }

  showMenu();
}

