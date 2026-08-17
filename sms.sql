CREATE DATABASE sms;
show databases;
use sms;
USE sms;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    course VARCHAR(100),
    email VARCHAR(100)
);
show tables;
use sms;
drop table students;
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    course VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);
show tables;
use sms;
select * from students;
use sms;
select * from students;
use sms;
show tables;
select * from teachers;
use sms;
show tables;
select * from teachers;




