## phaser-first
This repo is my first attempt at building a game with the phaser engine

### Prerequisites
1. Install the latest version of nodejs
* clone this repository
* cd into this repository from the terminal
* run `npm install` to install the dev and client dependencies

### How to run
Run the following in a terminal (with this repo as the working directory):

```
~$ npm run build
~$ npm run start
```

Then open `localhost:8080` from your favorite web browser.

### How to design the level
* Download [tilemap editor](http://www.mapeditor.org/) and follow the sidescroller tutorial at the bottom

### How to define physics bodies (for free)

1. Download the [Physics body editor](https://code.google.com/archive/p/box2d-editor/downloads)
* Ensure java is installed, unzip the file, open a terminal, and run `java -jar physics-body-editor.jar`
* Once the GUI is opened, load the image in question
* Click the edges of the image to define the polygon
* Save the project as a text file, and then run the [conversion script](python/convert_output.py) to convert the polygon from the box2d format to the phaser format
* Move the json object to the appropriate assets location, ensure webpack loads the resource, and import it in the codebase

### Credits

Sprite art: [GrafxKid's platformer baddies](http://opengameart.org/content/platformer-baddies)

Tutorials that helped me:
* http://www.lessmilk.com/tutorial/2d-platformer-phaser
* https://software.intel.com/en-us/html5/hub/blogs/how-to-make-a-sidescroller-game-with-html5
