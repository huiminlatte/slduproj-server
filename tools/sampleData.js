const student_events_participated = ["EEE Family Day", "Game Development"];

const event_to_attribute = [
  {
    "workshopevent": "EEE Family Day",
    "attribute1": "Critical Thinking",
    "attribute2": "Decision Making",
    "attribute3": "",
    "attribute4": "",
    "attribute5": ""
  },
  {
    "workshopevent": "Game Development",
    "attribute1": "Critical Thinking",
    "attribute2": "",
    "attribute3": "",
    "attribute4": "",
    "attribute5": ""
  },
  {
    "workshopevent": "Introduction to Arduino Workshop",
    "attribute1": "Decision Making",
    "attribute2": "Design Thinking",
    "attribute3": "Critical Thinking",
    "attribute4": "",
    "attribute5": ""
  }
];

const attribute_to_skillset = [
  {
    "attribute": "Critical Thinking",
    "skillset1": "Professional development",
    "skillset2": "Leadership",
    "skillset3": "Personal development"
  },
  {
    "attribute": "Decision Making",
    "skillset1": "Leadership",
    "skillset2": "Professional development",
    "skillset3": ""
  },
  {
    "attribute": "Design Thinking",
    "skillset1": "Innovation",
    "skillset2": "",
    "skillset3": ""
  }
];

module.exports = {
  student_events_participated,
  event_to_attribute,
  attribute_to_skillset,
};