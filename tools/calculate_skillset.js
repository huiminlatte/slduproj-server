module.exports = (student_events_participated, event_to_attribute, attribute_to_skillset) => {
  // console.log("student_events_participated", student_events_participated);

  // console.log("attribute_to_skillset", attribute_to_skillset);
  // console.log("event_to_attribute", event_to_attribute);
  for (var i = 0; i < student_events_participated.length; i++) {
    student_events_participated[i] = student_events_participated[i].replace(/\s/g, '');
  }


  var skillset_result = {
    "Professional development": 0,
    "Personal development": 0,
    "Leadership": 0,
    "Innovation": 0,
    "Technical": 0
  }
  var list_of_attributes = [];

  for (let i = 0; i < student_events_participated.length; i++) {
    for (let j = 0; j < event_to_attribute.length; j++) {
      if (student_events_participated[i] == event_to_attribute[j].WORKSHOPEVENT.replace(/\s/g, '')) {
        console.log(student_events_participated[i]);
        if (event_to_attribute[j].ATTRIBUTE1)
          list_of_attributes.push(event_to_attribute[j].ATTRIBUTE1.replace(/\s/g, ''));
        if (event_to_attribute[j].ATTRIBUTE2)
          list_of_attributes.push(event_to_attribute[j].ATTRIBUTE2.replace(/\s/g, ''));
        if (event_to_attribute[j].ATTRIBUTE3)
          list_of_attributes.push(event_to_attribute[j].ATTRIBUTE3.replace(/\s/g, ''));
        if (event_to_attribute[j].ATTRIBUTE4)
          list_of_attributes.push(event_to_attribute[j].ATTRIBUTE4.replace(/\s/g, ''));
        if (event_to_attribute[j].ATTRIBUTE5)
          list_of_attributes.push(event_to_attribute[j].ATTRIBUTE5.replace(/\s/g, ''));
      }
    }
  }
  console.log(list_of_attributes);

  var list_of_skillset = [];
  for (let i = 0; i < list_of_attributes.length; i++) {
    for (let j = 0; j < attribute_to_skillset.length; j++) {
      if (list_of_attributes[i] == attribute_to_skillset[j].ATTRIBUTE.replace(/\s/g, '')) {
        if (attribute_to_skillset[j].SKILLSET1)
          list_of_skillset.push(attribute_to_skillset[j].SKILLSET1.replace(/\s/g, ''));
        if (attribute_to_skillset[j].SKILLSET2)
          list_of_skillset.push(attribute_to_skillset[j].SKILLSET2.replace(/\s/g, ''));
        if (attribute_to_skillset[j].SKILLSET3)
          list_of_skillset.push(attribute_to_skillset[j].SKILLSET3.replace(/\s/g, ''));

      }
    }
  }
  console.log(list_of_skillset);
  for (let i = 0; i < list_of_skillset.length; i++) {
    if (list_of_skillset[i] == "Professionaldevelopment")
      skillset_result['Professional development']++;
    if (list_of_skillset[i] == "Personaldevelopment")
      skillset_result['Personal development']++;
    if (list_of_skillset[i] == "Leadership")
      skillset_result['Leadership']++;
    if (list_of_skillset[i] == "Innovation")
      skillset_result['Innovation']++;
    if (list_of_skillset[i] == "Technical")
      skillset_result['Technical']++;
  }

  var max = Math.max(skillset_result['Professional development'], skillset_result['Personal development'],
    skillset_result['Leadership'], skillset_result['Innovation'], skillset_result['Technical']);
  var result = [
    {
      skillset: 'Professional development',
      IndividualScore: parseFloat(skillset_result['Professional development']) / max * 100,
      max: max
    },
    {
      skillset: 'Personal development',
      IndividualScore: parseFloat(skillset_result['Personal development']) / max * 100,
      max: max
    },
    {
      skillset: 'Leadership',
      IndividualScore: parseFloat(skillset_result['Leadership']) / max * 100,
      max: max
    },
    {
      skillset: 'Innovation',
      IndividualScore: parseFloat(skillset_result['Innovation']) / max * 100,
      max: max
    },
    {
      skillset: 'Technical',
      IndividualScore: parseFloat(skillset_result['Technical']) / max * 100,
      max: max
    },
  ];

  return result;
}