<!DOCTYPE html>
<html>

<head>
  <title>Employee Management Database</title>
</head>

<body>
  <h1>Employee Management Database</h1>

  <p>
    This is a database for managing employees, departments, and job roles within an organisation. It allows you to perform
    various operations such as viewing employees, adding employees, updating employee information, and more.
  </p>

  <h2>Features</h2>

  <ul>
    <li>View all departments: Display a list of all departments in the organisation.</li>
    <li>View all job roles: Show a list of all job roles available.</li>
    <li>View all employees: View a list of all employees in the organisation.</li>
    <li>Add a department: Add a new department to the database.</li>
    <li>Add a job role: Create a new job role and assign it to a department.</li>
    <li>Add an employee: Add a new employee to the organisation.</li>
    <li>Update employee information: Modify employee details such as name, job role, or manager.</li>
    <li>View employees by manager: Display a list of employees under a specific manager.</li>
    <li>View employees by department: Show a list of employees within a particular department.</li>
    <li>View department budget: Calculate and display the budget of a department based on employee salaries.</li>
    <li>Delete department: Remove a department from the organisation, along with associated job roles and employees.</li>
    <li>Delete job role: Delete a job role from the organisation and reassign employees to a different role if necessary.</li>
  </ul>

  <h2>Installation</h2>

  <ol>
    <li>Clone the repository to your local machine.</li>
    <li>Import the SQL file (employeedatabase.sql) into your preferred database management system.</li>
    <li>Update the database connection details in the code files to match your database setup.</li>
    <li>Install the required dependencies using npm install.</li>
    <li>Start the application using node app.js.</li>
  </ol>

  <h2>Dependencies</h2>

  <ul>
    <li>MySQL: Database management system used to store and retrieve data.</li>
    <li>Node.js: JavaScript runtime used for executing the application.</li>
    <li>Inquirer.js: Library for interactive command-line user interfaces.</li>
    <li>Figlet: Generates ASCII art from text.</li>
  </ul>

  <h2>Usage</h2>

  <ol>
    <li>Run the application using node app.js.</li>
    <li>Follow the prompts to select the desired operation.</li>
    <li>Provide the required information as prompted.</li>
    <li>View or perform the desired actions based on the selected operation.</li>
    <li>Follow the on-screen instructions to navigate through the application.</li>
    <li>Use the "Exit" option to close the application.</li>
  </ol>

  <h2>License</h2>

<p>This project is licensed under the MIT License. See the <a href="LICENSE">LICENSE</a> file for details.</p>


</body>

</html>