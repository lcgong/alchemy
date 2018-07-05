/*jshint esversion: 6 */

// record, object, array, string, boolean, number, null
let schema = {
    "type": "record",
    "properties": {
        "age": {
            "type": ["string", "number"] 
        }
    },
    // "required": ["name", "email"]
};

// schema


annotate('.')

// .properties.age


