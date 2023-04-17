-- mysql database creation

DROP DATABASE IF EXISTS employee_manager_db;
CREATE DATABASE employee_manager_db;
USE employee_manager_db;

-- creating the departments tables

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

-- creating the roles table

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR (30),
    salary DECIMAL(10, 2),
    deparment_id INT,
    FOREIGN KEY (deparment_id),
    REFERENCES departments(id),
    ON DELETE SET NULL
);

-- creating the employee table

CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NOT NULL
);