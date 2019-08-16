module.exports = (student_events_participated, event_to_attribute, attribute_to_skillset) => {
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
      if (student_events_participated[i] == event_to_attribute[j].workshopevent) {
        if (event_to_attribute[j].attribute1)
          list_of_attributes.push(event_to_attribute[j].attribute1);
        if (event_to_attribute[j].attribute2)
          list_of_attributes.push(event_to_attribute[j].attribute2);
        if (event_to_attribute[j].attribute3)
          list_of_attributes.push(event_to_attribute[j].attribute3);
        if (event_to_attribute[j].attribute4)
          list_of_attributes.push(event_to_attribute[j].attribute4);
        if (event_to_attribute[j].attribute5)
          list_of_attributes.push(event_to_attribute[j].attribute5);
      }
    }
  }

  var list_of_skillset = [];
  for (let i = 0; i < list_of_attributes.length; i++) {
    for (let j = 0; j < attribute_to_skillset.length; j++) {
      if (list_of_attributes[i] == attribute_to_skillset[j].attribute) {
        if (attribute_to_skillset[j].skillset1)
          list_of_skillset.push(attribute_to_skillset[j].skillset1);
        if (attribute_to_skillset[j].skillset2)
          list_of_skillset.push(attribute_to_skillset[j].skillset2);
        if (attribute_to_skillset[j].skillset3)
          list_of_skillset.push(attribute_to_skillset[j].skillset3);
      }
    }
  }

  for (let i = 0; i < list_of_skillset.length; i++) {
    if (list_of_skillset[i] == "Professional development")
      skillset_result['Professional development']++;
    if (list_of_skillset[i] == "Personal development")
      skillset_result['Personal development']++;
    if (list_of_skillset[i] == "Leadership")
      skillset_result['Leadership']++;
    if (list_of_skillset[i] == "Innovation")
      skillset_result['Innovation']++;
    if (list_of_skillset[i] == "Technical")
      skillset_result['Technical']++;
  }
  console.log(skillset_result);

  var max = Math.max(skillset_result['Professional development'], skillset_result['Personal development'],
    skillset_result['Leadership'], skillset_result['Innovation'], skillset_result['Technical']);

  var result = [
    {
      skillset: 'Professional development',
      IndividualScore: skillset_result['Professional development'],
      max: max
    },
    {
      skillset: 'Personal development',
      IndividualScore: skillset_result['Personal development'],
      max: max
    },
    {
      skillset: 'Leadership',
      IndividualScore: skillset_result['Leadership'],
      max: max
    },
    {
      skillset: 'Innovation',
      IndividualScore: skillset_result['Innovation'],
      max: max
    },
    {
      skillset: 'Technical',
      IndividualScore: skillset_result['Technical'],
      max: max
    },
  ];

  return result;
}