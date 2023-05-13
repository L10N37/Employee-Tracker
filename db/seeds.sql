USE employeedatabase;

INSERT INTO department (name)
VALUES ('Engineering'), ('Finance'), ('Legal'), ('Sales');

INSERT INTO role (title, salary, departmentId)
VALUES ('Software Engineer', 120000, 1), ('Project Manager', 140000, 1), ('Sales Representative', 70000, 1), ('Human Resources Coordinator', 67000, 2), ('Marketing Manager', 72000, 2), ('IT Administrator', 90000, 2);

INSERT INTO employee (firstName, lastName, roleId)
VALUES ('Albert', 'Einwinkle', 1), ('Chiant', 'Beest', 4), ('Crah-Bee', 'Patty', 5);

INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES ('Sarah', 'Connor', 2, 2), ('John', 'Doe', 3, 1), ('Elroy', 'McNoggin', 6, 3);