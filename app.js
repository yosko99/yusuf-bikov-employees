const csvForm = document.getElementById('csv-form');
const csvFile = document.getElementById('csv-file');

const getOverlappingDays = (startDate1, endDate1, startDate2, endDate2) => {
    startDate1 = Date.parse(startDate1);
    endDate1 = Date.parse(endDate1);
    startDate2 = Date.parse(startDate2);
    endDate2 = Date.parse(endDate2);

    const earliestStart = Math.max(startDate1, startDate2);
    const latestEnd = Math.min(endDate1, endDate2);

    const difference = latestEnd - earliestStart;

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
}

const updateAnnouncementHTML = (employeeData) => {
    document.getElementById('announcement')
        .innerHTML = `Pair of employees who have worked together for ${employeeData.totalDaysTogether} days.`;
}

const updateTableBodyHTML = (employeeProjects) => {
    let tableBodyHTML = '';

    employeeProjects.forEach(project => {
        tableBodyHTML += `
        <tr>
            <th scope="row">${project.employeeID1}</th>
            <td>${project.employeeID2}</td>
            <td>${project.projectID}</td>
            <td>${project.daysWorked}</td>
        </tr>`
    });


    document.getElementById('table-body').innerHTML = tableBodyHTML;
}

const getPairWithMostDays = (data) => {
    let output = {};

    let maxDaysTogether = 0;
    let indexOfMaxDaysTogether = 0;

    data.forEach(currentEmployee => {
        const projectsWorkedAt = data.filter(
            (temp) => temp.projectID === currentEmployee.projectID && temp.employeeID !== currentEmployee.employeeID);

        projectsWorkedAt.forEach((workedWithEmployee) => {
            const overlappingDaysValue = getOverlappingDays(
                workedWithEmployee.startDate,
                workedWithEmployee.finishDate,
                currentEmployee.startDate,
                currentEmployee.finishDate
            );
            const customID = workedWithEmployee.employeeID + '-' + currentEmployee.employeeID;

            const outputData = {
                projectID: workedWithEmployee.projectID,
                employeeID1: workedWithEmployee.employeeID,
                employeeID2: currentEmployee.employeeID,
                daysWorked: overlappingDaysValue
            }

            if (output[customID] === undefined) {
                output[customID] = {
                    totalDaysTogether: overlappingDaysValue,
                    projectsTogether: [outputData]
                }
            } else if (!output[customID].projectsTogether.some((element) => element.projectID === workedWithEmployee.projectID)) {
                output[customID] = {
                    totalDaysTogether: output[customID].totalDaysTogether += overlappingDaysValue,
                    projectsTogether: [...output[customID].projectsTogether, outputData]
                }
            }
            if (maxDaysTogether < output[customID].totalDaysTogether) {
                indexOfMaxDaysTogether = customID;
                maxDaysTogether = output[customID].totalDaysTogether;
            }
        })
    });

    return output[indexOfMaxDaysTogether];
}


csvForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;

        const extractedData = text.split('\n').map((data) => {
            const splitData = data.split(',');
            
            return {
                employeeID: Number(splitData[0]),
                projectID: Number(splitData[1]),
                startDate: new Date(splitData[2]),
                finishDate: splitData[3] === 'NULL' || splitData[3] === null ? new Date() : new Date(splitData[3])
            }
        });

        const pairWithMostDays = getPairWithMostDays(extractedData);

        updateAnnouncementHTML(pairWithMostDays);
        updateTableBodyHTML(pairWithMostDays.projectsTogether);
    };

    reader.readAsText(input);
});