INSERT INTO departments (department_name)
VALUES
(Sales),
(Engineering),
(Finance),
(Legal);

INSERT INTO roles (title, salary, department_id)
VALUES
(Sales Lead, 100000, 1),
(Salesperson, 80000, 2),
(Lead Engineer, 15000, 3),
(Software Engineer, 120000, 4),
(Account Manager, 160000, 5),
(Accoutnant, 125000, 6),
(Legal Team Lead, 250000, 7),
(Lawyer, 190000, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
(John, Doe, 1, 1),
(Mike, Chan, 2, 2),
(Ashley, Rodriguez, 3, 3),
(Kevin, Tupik, 4, 4),
(Kunal Singh, 5, 5),
(Malia, Brown, 6, 6),
(Sarah Lourd,  7, 7),
(Tom, Allen, 8, 8);
