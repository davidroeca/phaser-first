import Phaser, { Game } from 'phaser'
import { MAIN_KEY } from './constants'

import MainState from './MainState'

const game = new Game(2500, 500, Phaser.AUTO)
game.state.add(MAIN_KEY, MainState, false)
game.state.start(MAIN_KEY)
