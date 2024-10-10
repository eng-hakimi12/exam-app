$(document).ready(function() {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const $tableHeader = $('thead tr');

    // Generate table headers for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        $tableHeader.append(`<th>${day}</th>`);
    }

    // Load attendance data from local storage
    loadAttendanceData();

    // Handle form submission for adding a new student
    $('#addStudentForm').submit(function(e) {
        e.preventDefault();
        const studentName = $('#studentName').val();
        if (studentName) {
            addStudentRow(studentName);
            $('#studentName').val('');
            $('#addStudentModal').modal('hide');
            saveAttendanceData();
        }
    });

    // Calculate and update attendance percentage
    $(document).on('change', '.attendanceCheckbox', function() {
        const $row = $(this).closest('tr');
        const totalDays = $row.find('.attendanceCheckbox').length;
        const attendedDays = $row.find('.attendanceCheckbox:checked').length;
        const attendancePercentage = ((attendedDays / totalDays) * 100).toFixed(2);
        $row.find('.attendancePercentage').text(attendancePercentage + '%');
        updateRowStyle($row, parseFloat(attendancePercentage));
        saveAttendanceData();
    });

    // Update row style based on attendance percentage
    function updateRowStyle($row, percentage) {
        $row.removeClass('no-attendance warning-attendance critical-attendance');
        $row.find('.warning-icon').addClass('d-none');
        $row.find('.exam-warning').addClass('d-none');

        if (percentage <= 10) {
            $row.addClass('no-attendance');
        } else if (percentage <= 24) {
            $row.addClass('warning-attendance');
            if (percentage > 15) {
                $row.find('.warning-icon').removeClass('d-none');
            }
        } else {
            $row.addClass('critical-attendance');
            $row.find('.exam-warning').removeClass('d-none');
        }
    }

    // Delete student row
    $(document).on('click', '.deleteStudent', function() {
        if (confirm('Are you sure you want to delete this student?')) {
            $(this).closest('tr').remove();
            saveAttendanceData();
        }
    });

    // Save attendance data to local storage
    function saveAttendanceData() {
        const attendanceData = [];
        $('#attendanceTable tr').each(function() {
            const $row = $(this);
            const studentName = $row.find('td:first').text();
            const attendancePercentage = $row.find('.attendancePercentage').text();
            const attendance = [];
            $row.find('.attendanceCheckbox').each(function() {
                attendance.push($(this).is(':checked'));
            });
            attendanceData.push({ studentName, attendancePercentage, attendance });
        });
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    // Load attendance data from local storage
    function loadAttendanceData() {
        const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
        attendanceData.forEach(student => {
            addStudentRow(student.studentName, student.attendance, student.attendancePercentage);
        });
    }

    // Add a student row to the table
    function addStudentRow(studentName, attendance = [], attendancePercentage = '0.00%') {
        const $row = $('<tr></tr>');
        $row.append(`<td>${studentName}</td>`);
        $row.append(`<td class="attendancePercentage">${attendancePercentage}</td>`);
        for (let day = 1; day <= daysInMonth; day++) {
            const isChecked = attendance[day - 1] ? 'checked' : '';
            $row.append(`<td><input type="checkbox" class="attendanceCheckbox" data-student="${studentName}" data-day="${day}" ${isChecked}></td>`);
        }
        $row.append('<td><button class="btn btn-danger deleteStudent">Delete</button> <span class="warning-icon d-none">⚠️</span><span class="exam-warning d-none"> - Not able to enter the exam</span></td>');
        $('#attendanceTable').append($row);

        // Update row style based on the percentage
        updateRowStyle($row, parseFloat(attendancePercentage));
    }
});
