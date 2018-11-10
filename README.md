# CostingModel

General-purpose single-page application for cost estimation tools. The tool's layout, fields, and calculcations are defined in JSON and rendered at load time. Printing is supported and the field values are stored in cookies; no back-end database needed. 

This app was written for health workers in Africa to enter key health parameters and calculate HIV drug doses for pregnant women and mothers.

Due to lack of support in browsers to store cookies on local URLs, run the following in a Terminal window before loading:

Python 2.x
$ python -m SimpleHTTPServer 8000

Python 3.x
$ python -m http.server 8000

Other 1-liners at https://gist.github.com/willurd/5720255

-- Jerry Harris

