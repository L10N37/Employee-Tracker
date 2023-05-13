USE employeedatabase;

INSERT INTO department (name)
VALUES
  ('Engineering'),
  ('Finance'),
  ('Legal'),
  ('Sales'),
  ('HR');

INSERT INTO role (title, salary, departmentId)
VALUES
  ('Software Engineer', 120000, 1),
  ('Project Manager', 140000, 1),
  ('Sales Representative', 70000, 4),
  ('Human Resources Coordinator', 67000, 5),
  ('Marketing Manager', 72000, 2),
  ('IT Administrator', 90000, 1);

INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES
  ('Albert', 'Einstein', 1, NULL),
  ('Fred', 'Durst', 4, NULL),
  ('Jasmine', 'Ryce', 5, NULL),
  ('Sarah', 'Connor', 2, 2),
  ('Chad', 'Grey', 3, 1),
  ('Mario', 'Duplantier', 6, 3);
