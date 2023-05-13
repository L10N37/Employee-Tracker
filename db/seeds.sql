USE employeedatabase;

INSERT INTO department (name)
VALUES             -- ID
  ('Engineering'), -- 1
  ('Finance'),     -- 2
  ('Legal'),       -- 3
  ('Sales'),       -- 4
  ('HR');          -- 5

INSERT INTO role (title, salary, departmentId)
VALUES                                               -- Role ID
  ('Software Engineer', 120000, 1),                  -- 1
  ('Project Manager', 140000, 5),                    -- 2
  ('Sales Representative', 70000, 4),                -- 3
  ('Receptionist', 49000, 5),                        -- 4
  ('Human Resources Coordinator', 67000, 5),         -- 5
  ('Marketing Manager', 72000, 2),                   -- 6
  ('IT Administrator', 90000, 1);                    -- 7

INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES
  ('Albert', 'Einstein', 1, NULL),
  ('Fred', 'Durst', 4, NULL),
  ('Jasmine', 'Ryce', 5, NULL),
  ('Sarah', 'Connor', 2, 2),
  ('Chad', 'Grey', 3, 1),
  ('Mario', 'Duplantier', 6, 3),
  ('James', 'Hetfield', 1, 1);
