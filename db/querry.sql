SELECT department.department_name AS department, reviews.reviews
FROM
LEFT JOIN department
ON reviews.department_id = department_id
ORDER BY departments.department_name