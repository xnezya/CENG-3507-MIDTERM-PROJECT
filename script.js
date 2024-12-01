// Global data structure for courses and students
const courses = [];
const students = [];

// DOM elements
const courseDropdown = document.getElementById("courseDropdown");
const addCourseForm = document.getElementById("addCourseForm");
const addStudentForm = document.getElementById("addStudentForm");
const studentTable = document.querySelector("#studentTable tbody");
const courseTitle = document.getElementById("courseTitle");
const searchStudentInput = document.getElementById("searchStudent");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

// Variable to hold the selected course
let selectedCourseName = "";

// When the Add Student form is submitted
addStudentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const studentName = document.getElementById("studentName").value.trim();
    const studentSurname = document.getElementById("studentSurname").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const midtermScore = parseFloat(document.getElementById("midtermScore").value);
    const finalScore = parseFloat(document.getElementById("finalScore").value);

    if (isValidStudentInput(studentName, studentSurname, studentId, midtermScore, finalScore)) {
        const course = courses.find(course => course.name === selectedCourseName);
        if (!course) return alert("Please select a valid course.");

        if (isStudentInCourse(course, studentId)) {
            alert(`Student with ID ${studentId} is already enrolled.`);
            return;
        }

        let student = students.find(s => s.id === studentId);
        if (!student) {
            student = { id: studentId, name: studentName, surname: studentSurname, grades: {} };
            students.push(student);
        }

        const GAP = calculateGAP(midtermScore, finalScore, course.gradingScale);
        student.grades[selectedCourseName] = { 
            midterm: midtermScore, 
            final: finalScore, 
            GAP: GAP 
        };
        student.grades[selectedCourseName].letterGrade = getLetterGrade(GAP, course.gradingScale);
        course.students.push(student);

        renderStudentTable();
        
        // Update course stats immediately
        updateCourseStatsTable(selectedCourseName);

        alert(`${studentName} ${studentSurname} has been added to the course!`);
        addStudentForm.reset();
    }
});

// Add Course
addCourseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const courseName = document.getElementById("courseName").value.trim().toUpperCase(); // Convert to uppercase
    const courseID = document.getElementById("courseID").value.trim();
    const gradingScale = document.getElementById("gradingScale").value.trim();

    if (isUniqueCourse(courseName, courseID)) {
        const newCourse = { name: courseName, ID: courseID, gradingScale, students: [] };
        courses.push(newCourse);

        // Update Course Dropdown and Table
        updateCourseDropdown();
        renderCourseTable();

        alert(`${courseName} added successfully!`);
        addCourseForm.reset();
    } else {
        alert("Please enter a unique course name and ID.");
    }
});

// When a course is selected, show Add Student form
courseDropdown.addEventListener("change", (e) => {
    selectedCourseName = e.target.value;
    const selectedCourse = courses.find(course => course.name === selectedCourseName);
    if (selectedCourse) {
        courseTitle.textContent = `Add Students for ${selectedCourse.ID} ${selectedCourseName.toUpperCase()}`;
        addStudentForm.style.display = "block";
        renderStudentTable();
    } else {
        courseTitle.textContent = "Select a Course to Add Students";
        addStudentForm.style.display = "none";
    }
});

// Event listener to handle course selection
courseDropdown.addEventListener("change", (e) => {
    selectedCourseName = e.target.value;
    const selectedCourse = courses.find(course => course.name === selectedCourseName);
    if (selectedCourse) {
        courseTitle.textContent = `Add Students for ${selectedCourse.ID} ${selectedCourseName.toUpperCase()}`;
        
        // Show passed, failed students and mean score
        updateCourseStatsTable(selectedCourseName);

        addStudentForm.style.display = "block";
        renderStudentTable();
    } else {
        courseTitle.textContent = "Select a Course to Add Students";
        addStudentForm.style.display = "none";
    }
});

// Check if course is unique (does not already exist)
const isUniqueCourse = (courseName, courseID) => {
    return !courses.some(course => course.name === courseName || course.ID === courseID);
};

// Validate student input
const isValidStudentInput = (name, surname, id, midterm, final) => {
    if (!name || !surname || !id || isNaN(midterm) || isNaN(final)) {
        alert("Please enter valid student information.");
        return false;
    }
    if (midterm < 0 || midterm > 100 || final < 0 || final > 100) {
        alert("Midterm and Final scores must be between 0 and 100.");
        return false;
    }
    return true;
};

// Check if student exists in the course
const isStudentInCourse = (course, studentId) => {
    return course.students.some(student => student.id === studentId);
};

// GAP Calculation (Grade Average Point)
const calculateGAP = (midterm, final, gradingScale) => {
    const gap = (midterm * 0.4 + final * 0.6); 
    return parseFloat(gap.toFixed(2)); // Calculate GAP and round to two decimal places
};

// Letter grade calculation based on grading scale
const getLetterGrade = (GAP, gradingScale) => {
    if (gradingScale === "10") {
        if (GAP >= 90) return "A";
        if (GAP >= 80) return "B";
        if (GAP >= 70) return "C";
        if (GAP >= 60) return "D";
        return "F";
    } else if (gradingScale === "7") {
        if (GAP >= 93) return "A";
        if (GAP >= 85) return "B";
        if (GAP >= 77) return "C";
        if (GAP >= 70) return "D";
        return "F";
    }
    return "F"; // Default case for invalid grading scale
};

// Render Student Table
// Render the table displaying the students
const renderStudentTable = () => {
    const studentTable = document.querySelector("#studentTable tbody");
    studentTable.innerHTML = ""; // Clear previous data

    const course = courses.find(course => course.name === selectedCourseName);
    if (!course || course.students.length === 0) {
        studentTable.innerHTML = "<tr><td colspan='7'>No students enrolled.</td></tr>";
        return;
    }

    course.students.forEach(student => {
        const GAP = student.grades[selectedCourseName]?.GAP || 0;
        const letterGrade = getLetterGrade(GAP, course.gradingScale);
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name.charAt(0).toUpperCase() + student.name.slice(1)} ${student.surname.toUpperCase()}</td>
            <td>${student.id}</td>
            <td>${student.grades[selectedCourseName]?.midterm || 0}</td>
            <td>${student.grades[selectedCourseName]?.final || 0}</td>
            <td>${GAP}</td>
            <td>${letterGrade}</td>
            <td>
                <button onclick="updateStudent('${student.id}')">Update</button>
                <button onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
        studentTable.appendChild(row);
    });
};

// Update Student
const updateStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
        // Prompt user for new student information
        const newName = prompt("Enter new Name", student.name);
        const newSurname = prompt("Enter new Surname", student.surname);
        const newId = prompt("Enter new ID", student.id);
        const newMidterm = parseFloat(prompt("Enter new Midterm Score", student.grades[selectedCourseName]?.midterm));
        const newFinal = parseFloat(prompt("Enter new Final Score", student.grades[selectedCourseName]?.final));

        // Validate the input and update student data
        if (isValidStudentInput(newName, newSurname, newId, newMidterm, newFinal)) {
            student.name = newName;
            student.surname = newSurname;
            student.id = newId;
            student.grades[selectedCourseName] = { 
                midterm: newMidterm, 
                final: newFinal, 
                GAP: calculateGAP(newMidterm, newFinal) 
            };

            renderStudentTable();
            alert("Student information updated.");
        }
    }
};

// Delete Student
const deleteStudent = (studentId) => {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        // Confirm if user really wants to delete the student
        const confirmDelete = confirm("Are you sure you want to delete this student?");
        if (confirmDelete) {
            const course = courses.find(course => course.name === selectedCourseName);
            if (course) {
                course.students = course.students.filter(s => s.id !== studentId);
                students.splice(studentIndex, 1);
                renderStudentTable();
                alert("Student deleted.");
            }
        }
    }
};

// Filter students by performance (Passed, Failed, All)
const filterStudents = (filterType) => {
    const course = courses.find(course => course.name === selectedCourseName);
    if (course) {
        const filteredStudents = course.students.filter(student => {
            const GAP = student.grades[selectedCourseName]?.GAP || 0;
            if (filterType === "passed" && GAP >= 60) return true;
            if (filterType === "failed" && GAP < 60) return true;
            return filterType === "all";
        });
        renderStudentTable(filteredStudents);
    }
};

// Update Course function (updating grading scale)
const updateCourse = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    if (course) {
        const newCourseName = prompt("Enter new Course Name", course.name).toUpperCase(); // Convert to uppercase
        const newCourseID = prompt("Enter new Course ID", course.ID);
        const newGradingScale = prompt("Enter new Grading Scale (10 or 7)", course.gradingScale);

        if (newCourseName && newCourseID && (newGradingScale === "10" || newGradingScale === "7")) {
            course.name = newCourseName;
            course.ID = newCourseID;

            // If grading scale changed, update students' letter grades
            if (newGradingScale !== course.gradingScale) {
                updateCourseGradingScale(course.name, newGradingScale);
            } else {
                course.gradingScale = newGradingScale;
                renderCourseTable();
                alert("Course updated successfully!");
            }
        } else {
            alert("Please provide valid inputs.");
        }
    }
};

// Delete Course
const deleteCourse = (courseName) => {
    const courseIndex = courses.findIndex(c => c.name === courseName);
    if (courseIndex !== -1) {
        const confirmDelete = confirm(`Are you sure you want to delete the course: ${courseName}?`);
        if (confirmDelete) {
            // Update course and student list
            courses.splice(courseIndex, 1);
            updateCourseDropdown();
            renderCourseTable();
            alert(`Course ${courseName} has been deleted.`);
        }
    }
};

// Update Course Dropdown
const updateCourseDropdown = () => {
    courseDropdown.innerHTML = '<option value="">Select Course</option>';
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = course.name;
        option.textContent = course.name; // Will be in uppercase
        courseDropdown.appendChild(option);
    });
};

// Render Course Table with Update and Delete Buttons
const renderCourseTable = () => {
    const courseList = document.getElementById("courseList");
    courseList.innerHTML = "";
    courses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.ID}</td>
            <td>${course.gradingScale === "10" ? "10-Point Scale" : "7-Point Scale"}</td>
            <td>
                <button onclick="updateCourse('${course.name}')">Update</button>
                <button onclick="deleteCourse('${course.name}')">Delete</button>
            </td>
        `;
        courseList.appendChild(row);
    });
};

// Update grading scale for course
const updateCourseGradingScale = (courseName, newGradingScale) => {
    const course = courses.find(c => c.name === courseName);
    if (course) {
        const oldGradingScale = course.gradingScale;
        course.gradingScale = newGradingScale; // Update new grading scale

        // Update students' letter grades based on old and new grading scale
        course.students.forEach(student => {
            updateStudentLetterGrade(student, oldGradingScale, newGradingScale, courseName);
        });

        // Render table again after updating course info
        renderStudentTable();
        alert(`${courseName} grading scale updated successfully!`);
    }
};

// Update student scores based on grading scale conversion
const updateStudentScores = (student, oldGradingScale, newGradingScale, courseName) => {
    const midterm = student.grades[courseName]?.midterm;
    const final = student.grades[courseName]?.final;
    if (!midterm || !final) return; // Do nothing if student has no scores

    if (oldGradingScale === "10" && newGradingScale === "7") {
        student.grades[courseName].midterm = convertScore10to7(midterm);
        student.grades[courseName].final = convertScore10to7(final);
    } else if (oldGradingScale === "7" && newGradingScale === "10") {
        student.grades[courseName].midterm = convertScore7to10(midterm);
        student.grades[courseName].final = convertScore7to10(final);
    }

    // Recalculate GAP
    const GAP = calculateGAP(student.grades[courseName].midterm, student.grades[courseName].final, newGradingScale);
    student.grades[courseName].GAP = GAP;
    student.grades[courseName].letterGrade = getLetterGrade(GAP, newGradingScale);
};

// Convert score from 10-point scale to 7-point scale
const convertScore10to7 = (score) => {
    return (score / 10) * 7; // Convert to 7-point scale
};

// Convert score from 7-point scale to 10-point scale
const convertScore7to10 = (score) => {
    return (score / 7) * 10; // Convert to 10-point scale
};

// Render student scores for each course
const renderStudentScores = (course) => {
    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";
    course.students.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.score}</td>
            <td>${student.grade}</td>
        `;
        studentList.appendChild(row);
    });
};

// Update student's letter grade
const updateStudentLetterGrade = (student, oldGradingScale, newGradingScale, courseName) => {
    const midterm = student.grades[courseName]?.midterm;
    const final = student.grades[courseName]?.final;

    if (!midterm || !final) return; // Do nothing if student has no scores

    // Recalculate GAP based on new grading scale
    const GAP = calculateGAP(midterm, final, newGradingScale);

    // Update letter grade based on new grading scale
    student.grades[courseName].letterGrade = getLetterGrade(GAP, newGradingScale);
};

// Calculate pass/fail stats for a course
const calculatePassFailStats = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    if (!course) return;

    let passed = 0;
    let failed = 0;
    let totalScore = 0;
    let totalStudents = 0;

    // Check each student's GAP and calculate scores
    course.students.forEach(student => {
        const midterm = student.grades[courseName]?.midterm;
        const final = student.grades[courseName]?.final;

        if (midterm !== undefined && final !== undefined) {
            const GAP = calculateGAP(midterm, final, course.gradingScale);
            totalScore += GAP; // Calculate total GAP for average score
            totalStudents++;

            if (GAP >= 60) {
                passed++; // Increment passed students count
            } else {
                failed++; // Increment failed students count
            }
        }
    });

    // Calculate average GAP score
    const meanScore = totalStudents > 0 ? (totalScore / totalStudents).toFixed(2) : 0;

    return { passed, failed, meanScore };
};

// Update course stats table
const updateCourseStatsTable = (courseName) => {
    const stats = calculatePassFailStats(courseName);
    const tableBody = document.querySelector("#courseStatsTable tbody");

    // Clear the table
    tableBody.innerHTML = "";

    if (stats) {
        // Create new row and append data
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${courseName.toUpperCase()}</td>
            <td>${stats.passed}</td>
            <td>${stats.failed}</td>
            <td>${stats.meanScore}</td>
        `;
        tableBody.appendChild(row);
    } else {
        console.log("No stats available for the course."); // Debugging output
    }
};

// When the search button is clicked, filter the students based on input
searchButton.addEventListener("click", () => {
    const searchQuery = searchStudentInput.value.trim().toLowerCase(); // Get search query
    const course = courses.find(course => course.name === selectedCourseName); // Find the selected course

    if (!course) {
        alert("Please select a course.");
        return;
    }

    // Filter the students based on search query
    const filteredStudents = course.students.filter(student => {
        const studentFullName = `${student.name.toLowerCase()} ${student.surname.toLowerCase()}`;
        const studentId = student.id.toLowerCase();
        return studentFullName.includes(searchQuery) || studentId.includes(searchQuery);
    });

    // Display the search results
    if (filteredStudents.length === 0) {
        searchResults.innerHTML = "<p>No results found.</p>";
    } else {
        searchResults.innerHTML = ""; // Clear previous results
        filteredStudents.forEach(student => {
            const GAP = student.grades[selectedCourseName]?.GAP || 0;
            const letterGrade = getLetterGrade(GAP, course.gradingScale);

            const studentRow = document.createElement("div");
            studentRow.classList.add("student-result");

            studentRow.innerHTML = `
                <p><strong>${student.name} ${student.surname}</strong> (ID: ${student.id})</p>
                <p>Midterm: ${student.grades[selectedCourseName]?.midterm || 0}, Final: ${student.grades[selectedCourseName]?.final || 0}, GAP: ${GAP}, Grade: ${letterGrade}</p>
            `;
            searchResults.appendChild(studentRow);
        });
    }
});

// Render search results
const renderSearchResults = (results) => {
    searchResults.innerHTML = ""; // Clear previous search results

    if (results.length === 0) {
        searchResults.innerHTML = "No results found."; // If no results, display message
    } else {
        results.forEach(student => {
            // Create a div for each student with details
            const resultItem = document.createElement("div");
            resultItem.innerHTML = `
                <strong>Name:</strong> ${student.name} ${student.surname} <br>
                <strong>ID:</strong> ${student.id} <br>
                <strong>Courses and Grades:</strong><br>
                ${Object.keys(student.grades).map(courseName => {
                    const course = student.grades[courseName];
                    return `${courseName}: Midterm - ${course.midterm}, Final - ${course.final}, GAP - ${course.GAP}<br>`;
                }).join("")}
                <hr>
            `;
            searchResults.appendChild(resultItem);
        });
    }
};