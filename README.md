This repository contains a framework for a mobile-based task, allowing participants to roll dice by shaking their phone.   It was developed for the project "A novel test of a widely-cited consequence of the illusion of control in gambling" registered [here](https://osf.io/q58ab/).


The project was developed in Node-js 14.18.1, on WSL2 (Ubuntu), and builds for distribution using [parcel](https://parceljs.org/).
Required dependencies can be installed from package-lock.json.

This task was designed for use in an oTree experiment.  The code for the experiment we ran as part of the above project can be accessed in the [oTree-henslin-effect](https://github.com/tyhayeswbs/oTree-henslin-effect) repository. The compiled javascript source index.js should be included in the dice_rolling/static/dice_rolling directory.

License
=======
This software is licensed under an MIT-like license, with the additional requirement that licensees undertakes to cite following article in all publications in which results of experiments conducted with the Software are published:

Hayes, T.; Walasek, L.; Browne, M.; Newall, P.; (2023) The Active Foundations of the Illusion of Control: Evidence for a General Henslin Effect (working paper).

See LICENSE file for more details.

Dev Environment Setup
=====================

Node-js and npm should be installed before you start.

cd into the root directory of this project (i.e. this directory, which contains package.json)

Install required dependencies:

`npm install package.json`

Building the js script
======================

`npm run-script build`

For use with the oTree-henslin-effect wrapper, the js output of the build process should be renamed to
index.js, and copied into dice_rolling/static/dice_rolling, overwriting any index.js already there.

Usage
=====

To set from WSL, open a port:

`netsh interface portproxy add v4tov4 listenport=1234 listenaddress=0.0.0.0 connectport=1234 connectaddress=$($(wsl hostname -I).Trim())`

(note you will need to mock a response from the server to proceed past the end of a trial)

If you need to reset and rebind, use:
`netsh interface portproxy delete v4tov4 listenport=1234 listenaddress=0.0.0.0`

to build:  run `npm run-script build`

to run: run `npm run-script serve`

To access, connect a mobile to the same network
and access via the IP of the windows host followed by the port number
e.g. https://192.168.1.1:1234

Due to restrictions on device sensors, the page MUST be accessed
over https. 
