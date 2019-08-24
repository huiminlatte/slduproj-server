module.exports = (event1_absentees, event2_absentees) => {

    // const event1_absentees = [{
    //         "STUDENTNAME": "PRAWIRA",
    //         "MATRICNUMBER": "U1745716",
    //     },
    //     {
    //         "STUDENTNAME": "HUI MIN",
    //         "MATRICNUMBER": "U1745718",
    //     }
    // ];

    // const event2_absentees = [{
    //         "STUDENTNAME": "PRAWIRA",
    //         "MATRICNUMBER": "U1745716",
    //     },
    //     {
    //         "STUDENTNAME": "ELAINE",
    //         "MATRICNUMBER": "U1745717",
    //     }
    // ];

    var absentees_2events = [];
    for (var i = 0; i < event1_absentees.length; i++) {
        //console.log(event1_absentees[i].MATRICNUMBER);
        for (var j = 0; j < event2_absentees.length; j++) {
            //console.log(event2_absentees[j].MATRICNUMBER);
            if (event1_absentees[i].MATRICNUMBER == event2_absentees[j].MATRICNUMBER) {
                absentees_2events.push(event1_absentees[i]);
            }
        }
    }

    return absentees_2events;
}