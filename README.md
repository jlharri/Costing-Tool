# CostingModel

General-purpose single-page application for cost estimation tools. The tool's layout, fields, and calculcations are defined in JSON and rendered at load time. Printing is supported and the field values are stored in cookies; no back-end database needed. 

This app was written for health workers in Africa to enter key health parameters and calculate HIV drug doses for pregnant women and mothers.

## Dev note
The app will run if you local index.html in a browser window. The only feature that won't work is storing values across page loads. Browsers stopped supporting this a few years ago. To get around this, you can run a simple web server on your machine with if you have Python installed. Run one of these from the top directory of Costing Model. 

Python 2.x
$ python -m SimpleHTTPServer 8000

Python 3.x
$ python -m http.server 8000

Other 1-liners at https://gist.github.com/willurd/5720255

## Technical Design

Main Features:
 * calculations made on-the-fly
 * print mode available
 * values entered are saved across sessions in cookies
    * these are chunked in multiple cookies due to limitations to cookie sizes in 2011
 
## UI Model

The layout and content of the form is defined in a JSON blob in the variable UIModel_JSON. Each JSON entry corresponds with a UI element that is rendered on the form: 
* Section (tabs) 
* Sub-section (accordion)
* Text 
* Input field 
* Calculated value 
* Option list 
* Tooltip help

## Key Fields
 
* Type : [section numInput Calculation select option]
* id : Unique identifier for field
* text : free-form text for field
* text_class : [section numInput option largeBold normalBold Calculation]
* input_class : [<null> smallNum percent bigNum currency select]
* calc : string containing calculation for field
* concat : whether the next element stays on the same line (eg, table row)
* help : string for tooltip
  
## Option Menu
A popup menu will be built based on a sequence of the following sequence of JSON items:
```
{       
  "type": "select",
  "text": [
    "Option 1"
  ],
  "concat": "yes"
},
{
  "type": "option",
  "text": [
    "Option 2"
  ],
  "textClass": "option"
},
{
  "type": "option",
  "text": [
    "Option 3"
  ],
  "textClass": "option"
},
{
  "type": "endSelect"
},
```
