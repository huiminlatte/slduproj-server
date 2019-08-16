// import { events_participated, events_attribute, attribute_to_skillset } from './sampleData';
const student_events_participated = require('./sampleData').student_events_participated;
const event_to_attribute = require('./sampleData').event_to_attribute;
const attribute_to_skillset = require('./sampleData').attribute_to_skillset;




const calculate_skillset = require('./calculate_skillset');
const result = calculate_skillset(student_events_participated, event_to_attribute, attribute_to_skillset);
console.log(result);