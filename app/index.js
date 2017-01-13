import { Game } from 'phaser'
import { MAIN_KEY } from './constants'

import MainState from './MainState'

const game = new Game(500, 500)
game.state.add(MAIN_KEY, MainState, false)
game.state.start(MAIN_KEY)
