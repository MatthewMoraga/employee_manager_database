// importing packages and setting up middleware

const inquirer = require("inquirer");
const mysql = require("mysql2");
const PORT = 3000;
const express = require("express");
const app = express();

// creating a connection through mysql to connect to the database to make queries

const connection = mysql.createConnection({
    user: "root",
    password: "",
    database: "employee_manager_db"
});

// setting the connection to a method to use for promises to bring in the database

connection.connect((err) => {
    if (err) throw err;
    console.log("connected to db");
    start()
})

// this function sets up the starting menu with switch case to run a function for each menu action with inquirer prompt

function start() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "select an option",
            choices: [
                "view all departments",
                "view all roles",
                "view all employees",
                "add a department",
                "add a role",
                "add an employee",
                "add a manager",
                "update an employee role",
                "view employees by manager",
                "view employees by department",
                "delete departments - roles - employees",
                "view the total budget of a department",
                "exit",
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case "view all departments":
                    viewAllDepartments();
                    break;
                case "view all roles":
                    viewAllRoles();
                    break;
                case "view all employees":
                    viewAllEmployees();
                    break;
                case "add a department":
                    addDepartment();
                    break;
                case "add a role":
                    addRole();
                    break;
                case "add an employee":
                    addEmployee();
                    break;
                case "add a manager":
                    addManager();
                    break;
                case "update an employee role":
                    updateEmployeeRole();
                    break;
                case "view employees by manager":
                    viewEmployeesByManager();
                    break;
                case "view employees by department":
                    viewEmployeesByDepartment();
                    break;
                case "delete departments - roles - employees":
                    deleteDepartmentsRolesEmployees();
                    break;
                case "view the total budget of a department":
                    viewTotalBudgetOfDepartment();
                    break;
                case "exit program":
                    connection.end();
                    console.log("connection ended");
                    break;
            }
        });
}

// a function that runs a query to view the departments table and set a connection to it and responds back with the departments table

function viewAllDepartments() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// a function that runs a query that gets the role table and joins it with the departments table with the foreign key and responds back with the roles table

function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id"
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// a function that runs a query that selects the values with shorthand e, r, and d and then joins all 3 tables with the roles table foreign key and gets the data 
// that matches the employees with the department ids and manager ids on the employee table

function viewAllEmployees() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// this function runs a prompt that asks the user to enter a department name then a query is run that inserts the new department into the departments table
// then the user is shown a message if it worked or not and then start sends them back to the main menu where they can view the table and it's changes

function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "enter the new department's name"
        })
        .then((answer) => {
            console.log(answer.name);
            const query= `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`added department ${answer.name} to db`);
                start();
                console.log(answer.name);
            })
        })
}

// this function runs a query that gets the departments table for the user then a prompt is run that asks the user to enter a name for the role
// then a salary and then the prompt asks the user to pick a department for it which is selected by a map method
// then when the user picks a department then it responds back with a find method so that it adds the new role to the department they picked
// then a query is run that the user input into an object and inserts into the roles table and then responds back with the table changes for the user

function addRole() {
    const query = "SELECT * FROM departments"
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "enter a title for the new role"
                },
                {
                    type: "input",
                    name: "salary",
                    message: "enter the salary for the new role"
                },
                {
                    type: "list",
                    name: "department",
                    message: "select the department for the new role:",
                    choices: res.map(
                        (department) => department.department_name
                    ),
                },
            ])
            .then((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );
                const query = "INSERT INTO roles SET?"
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        department_id: department,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`added role ${answers.tile} with salary ${answers.salary} to the ${answers.department} to the db`);
                        start();
                    }
                );
            });
    });
}

// this function runs a query that gets the data for the employee by role_id which results is passed through and set through a const roles
// so that it finds the employee role_id and title with the map method then another query is run that when the user is shown an employee
// it concats the employee name and spaces the first name and last name. It also needs to get the manager for that employee which gets 
// the data from the employee table but this time through manager_id and name with a map method and then after those queries are run
// a prompt runs that asks the user to input the employee first_name, last_name, role_id and manager_id which doesn't get the name or value
// so an array with object of name: none and value: null and it uses a spread operator to make sure the table doesn't grab those properties
// then a query is run that inserts the new employee into the employee table and also use the ? operator in so that it doesn't cause an error
// if null or undefined is referenced so that the tables can use those as an option to display to the user

function addEmployee () {
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }
        const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
        }));
        connection.query( 
            `SELECT id, CONCAT(first_name, "", last_name) AS name FROM employee`,
            (error, results) => {
                if (error) {
                    console.error(error);
                    return;
                }
                const managers = results.map(({ id, name }) => ({
                    name,
                    value: id,
                }));
                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstname",
                            message: "enter the employee's first name",
                        },
                        {
                            type: "input",
                            name: "lastname",
                            message: "enter the employee's last name",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "select the employee's role",
                            choices: roles,
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "select the employee's manager",
                            choices: [
                                { name: "none", value: null },
                                ...managers,
                            ],
                        },
                    ])
                    .then((answers) => {
                        const mysql =
                        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                        const VALUES = [
                            answers.firstName,
                            answers.lastName,
                            answers.roleId,
                            answers.managerId,
                        ];
                        connection.query(mysql, VALUES, (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            console.log("employee added");
                            start();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        );
    });
}

// this function sets queries from departments and employees so that the user can add a manager to them
// then connection starts a prompt that the user chooses a department then chooses an employee then chooses a manager to add to the selected employee
// then answers this time responds with the selectors using template literal to find the employee and manager
// then a query is made that grabs the mangager id an sets it with a WHERE clause to set the role_id with the manager id from roles usin the department id
// which uses an ? operator so that existing managers can be set to NULL and the user can see the change

function addManager() {
    const queryDepartments = "SELECT * FROM departments";
    const queryEmployees = "SELECT * FROM employee";

    connection.query(queryDepartments, (err, resDepartments) => {
        if (err) throw err;
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "choose a department",
                        choices: resDepartments.map( 
                            (department) => department.department_name
                        ),
                    },
                    {
                        type: "list",
                        name: "employee",
                        message: "choose an employee to add to a manager",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "choose the selected employee's manager",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                ])
                .then((answers) => {
                    const department = resDepartments.find(
                        (department) =>
                            department.department_name === answers.department
                    );
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                    );
                    const manager = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.manager
                    );
                    const query = 
                        "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
                    connection.query(
                        query,
                        [manager.id, employee.id, department.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(`added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name} to the ${department.department_name} department!`);
                            start()
                        }
                    );
                });
            
        });
    });
}

// this function is so that the user can update the employee's role using a query from the employees table using id, first name, and last name
// then the role is joined from the roles tables which grabs the epmloyee role id to change it to the new role id
// then the user is prompted to choose an employee to update from a list and then is asked to choose a role using the map method to find and change the roles with selectors
// then answers is similar to the previous function and finds the roles from the employee tables and overwrites it from the roles from the roles table using the ids
// then a query is made to change the current role to the new role and the connection connects the role id with the employee id to show the user

function updateEmployeeRole() {
    const queryEmployees =
        "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "choose the employee to update",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "choose a new role",
                        choices: resRoles.map((role) => role.title),
                    },
                ])
                .then((answers) => {
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                    );
                    const role = resRoles.find(
                        (role) => role.title === answers.role
                    );
                    const query =
                        "UPDATE employee SET role_id = ? WHERE id = ?";
                    connection.query(
                        query,
                        [role.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(`${employee.first_name} ${employee.last_name}'s role updated to ${role.title} to the db`);
                            start()
                        }
                    );
                });
        });
    });
}

// this function sets a query that uses shorthands to grab the employee info from the employee table and their role from the role table and the department
// then CONCATs the manager first name and last name from the manager table AS the manger name when the manger is shown to the user
// then they selected FROM the employee table which is INNER JOINED with the roles shorthand ON the employee role together with the role id
// then another INNER JOIN happens with the departments and then a LEFT JOIN is needed to show the user the employee's manager
// then an order is set so that the user sees the manager first and then the employee.
// then a connection is made that grabs the manager name set trough an array of manager names with a push method so that the manager is grabbed when the user chooses an employee
// then we to loop through the manager array so that only that employees manager can be shown for that employee using the employee const to match them with a manager


function viewEmployeesByManager() {
    const query = `
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            r.title,
            d.department_name,
            CONCAT(m.first_name, "  ", m.last_name) AS manager_name
        FROM
            employee e
            INNER JOIN roles r ON e.role_id = r.id
            INNER JOIN departments d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id
        ORDER BY
            manager_name,
            e.last_name,
            e.first_name
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;

        const employeesByManager = res.reduce((ebm, mng) => {
            const managerName = mng.manager_name;
            if(ebm[managerName]) {
                ebm[managerName].push(mng);
            } else {
                ebm[managerName] = [mng];
            }
            return ebm;
        }, {});
        console.log("employees by manager");
        for (const managerName in employeesByManager) {
            console.log(`\n${managerName}`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                console.log(`${employee.first_name} ${employee.last_name} - ${employee.title} - ${employee.department_name}`);
            });
        }
        start();
    });
}

// a function that lets the user view employees by dapartment which does done by making a query that joins the employee table with roles table from employee role with roleid which is
// then joined by departments id and then ordered by department name
// we use inner joins so that the user can see the employees, employee role, and what department they are in with matching ids

function viewEmployeesByDepartment() {
    const query = "SELECT departments.department_name, employee.first_name, employee.last_name FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY departments.department_name ASC";

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nemployees by department");
        console.table(res);

        start();
    });
} 

// this function lets the user pick an option for what the want delete using a submenu similar to the starting menu using switch cases


function deleteDepartmentsRolesEmployees() {
    inquirer
        .prompt({
            type: "list",
            name: "data",
            message: "choose an option to delete",
            choices: ["employee", "role", "department"],
        })
        .then((answer) => {
            switch (answer.data) {
                case "employee":
                    deleteEmployee();
                    break;
                case "role":
                    deleteRole();
                    break;
                case "department":
                    deleteDepartment()
                    break;
                default:
                    console.log(`no data ${answer.data}`);
                    start();
                    break;
            }
        });
}

// this function allows the user to delete an employee by using a query that selects the employee table
// then uses the map method to grab the employees from the query
// then a prompt asks the user to choose an employee to delete which then another query is run that deletes the employee by id

function deleteEmployee() {
    const query = "SELECT * FROM employee";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const employeeRoster = res.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));
        employeeRoster.push({ name: "return", value: "return" });
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "choose employee to delete",
                choices: employeeRoster,
            })
            .then((answer) => {
                if (answer.id === "return") {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = "DELETE FROM employee WHERE id = ?";
                connection.query(query, [answer.id], (err, res) => {
                    if (err) throw err;
                    console.log(`employee deleted with ID ${answer.id} from the db`);

                    start()
                });
            });
    });
}

// delete role is pretty much the same is delete employee but for roles

function deleteRole() {
    const query = "SELECT * FROM roles";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const choices = res.map((role) => ({
            name: `${role.title} (${role.id}) - ${role.salary}`,
            value: role.id,
        }));
        choices.push({ name: "return", value: null });
        inquirer
            .prompt({
                type: "list",
                name: "roleId",
                message: "choose a role to delete",
                choices: choices,
            })
            .then((answer) => {
                if (answer.roleId === null) {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = "DELETE FROM roles WHERE id = ?";
                connection.query(query, [answer.roleId], (err, res) => {
                    if (err) throw err;
                    console.log(`role deleted id ${answer.roleId} from db`);
                    start();
                });
            });
    });
}

// and delete department is pretty much the same except that it deletes departments

function deleteDepartment() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department)  => ({
            name: department.department_name,
            value: department.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "choose a dept to delete",
                choices: [...departmentChoices, { name: "return", value: "return" }],
            })
            .then((answer) => {
                if (answer.departmentId === "return") {
                    deleteDepartmentsRolesEmployees();
                } else {
                    const query = "DELETE FROM departments WHERE id = ?";
                    connection.query(query, [answer.departmentId], (err, res) => {
                        if (err) throw err;
                        console.log(`dept with ID ${answer.departmentId} deleted from db`);
                        start();
                    });
                }
            });
    });
}

// this function allows the user to see the total budget of a department by making a query that selects departments
// then a const with the department choices is made so that the map method can access the salary to get a total
// then a prompt asks the user to choose a department that comes from that const from earlier
// then with answers a query is made that selects departments and then a SUM is made using roles.salary from the roles table
// from the departments table then inner joins are made between the departments id and then another inner join is made 
// with employee with the roles.id so that roles can grab the employee salary to match with the department so that 
// user is shown the salary by department 
// then a connection is made to show the user the salary by department id using the salarySum const so that it can be
// shown in the console log

function viewTotalBudgetOfDepartment() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department) => ({
            name: department.department_name,
            value: department.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "choose a department to get it's total salary",
                choices: departmentChoices,
            })
            .then((answer) => {
                const query = `
                SELECT
                departments.department_name AS department,
                SUM(roles.salary) AS total_salary
                FROM
                departments
                INNER JOIN roles ON departments.id = roles.department_id
                INNER JOIN employee ON roles.id = employee.role_id
                WHERE
                departments.id = ?
                GROUP BY
                departments.id;
                `;
                connection.query(query, [answer.departmentId], (err, res) => {
                    if (err) throw err;
                    const salarySum = res[0].total_salary;
                    console.log(` sum of salaries of employees is ${salarySum} in this department`);
                    start();
                });
            });
    });
}

// this process ends the connection with the db when the user exits the prompt menu using exit

process.on("exit", () => {
    connection.end();
});

// starts the server

app.listen(PORT, () => console.log("server started on PORT %s", PORT));

