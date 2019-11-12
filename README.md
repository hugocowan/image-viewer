# image-viewer

A giphy-style image viewer. Add your images and keep your own local image file server.

![An example of the site](./public/image-viewer.png)

## Instructions for use:

* Download or clone this repository

* Install node

* Open a command line, navigate to the project root directory. 

* Type `node server`

* Open up another command line at the project dir, type `npm start`

* Add/remove your images through the webpage, under the files section of the navbar. Click on the burger in the top left to access the sections.

### Make a local web server using serve and tmux:

* npm install -g serve tmux

* Navigate to the project's root folder.

* Type `yarn build`, hit enter. Wait for the build to finish.

* Type `tmux`, hit enter.

* Type `serve -s build` and hit enter.

* Go to the url specified to view your locally hosted webpage.

You can detach from the tmux session with `Ctrl-b d`, and re-attach to it with `tmux attach -t [session name]`. Find the session name by typing `tmux list-sessions` (normally `0`).

### Set your server's ip address

If you're hosting your server outside of your local machine, you can specify its ip address in .env.

* Make a .env file at the root level (/image-viewer) with your server's ip address specified: 

* Type `touch .env`

* Type `echo "REACT_APP_API_URL=http://192.168.1.1" > .env` where `192.168.1.1` is your server ip address. If it's your local machine, you can use `http://localhost` instead of an ip address.

* Restart your client and server.
