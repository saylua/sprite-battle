import React, { Component } from 'react';

import { BACKGROUND_LIST } from './helpers/backgroundList';
import { randomChoice } from './helpers/utils';
import { randomSprite } from './helpers/spriteHelper';
import Battle from './Battle';
import Den from './Den';
import SpriteImage from './SpriteImage';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSprite: 0,
      area: randomChoice(BACKGROUND_LIST),
      sprites: [randomSprite()],
      viewingDen: false,
      continueTexts: ["Begin!"],
      playerTurn: true,
    }
    this.startBattle = this.startBattle.bind(this);
    this.placeholderAttack = this.placeholderAttack.bind(this);
    this.opponentAttack = this.opponentAttack.bind(this);
    this.endBattle = this.endBattle.bind(this);
    this.catchOpponent = this.catchOpponent.bind(this);
    this.viewDen = this.viewDen.bind(this);
    this.switchSprite = this.switchSprite.bind(this);
    this.levelUp = this.levelUp.bind(this);
    this.continue = this.continue.bind(this);
    this.flee = this.flee.bind(this);
    this.clickAfterWait = this.clickAfterWait.bind(this);
  }

  componentDidMount() {
    this.startBattle();
  }

  startBattle() {
    const newActiveSprite = this.getActiveSprite();
    const newSprites = this.state.sprites.slice();
    newActiveSprite.hp = newActiveSprite.maxhp;
    newSprites[this.state.activeSprite] = newActiveSprite;
    this.setState({
      opponent: randomSprite(),
      sprites: newSprites,
    });
  }

  clickAfterWait(id) {
    setTimeout(function(){
      const found = document.getElementById(id);
      if (found) {
        found.click();
      }
    }, 1500);
  }

  flee() {
    const escaped = Math.random() * 1.5 > this.state.opponent.hp / this.state.opponent.maxhp;
    const newContinueTexts = this.state.continueTexts;
    if (escaped) {
      newContinueTexts.unshift(`You escaped from ${this.state.opponent.name}!`);
      this.setState({
        opponent: null,
        continueTexts: newContinueTexts,
      });
    } else {
      newContinueTexts.unshift(`You failed to escape!`);
      this.setState({
        continueTexts: newContinueTexts,
        playerTurn: false,
      });
    }
  }

  endBattle() {
    const newContinueTexts = this.state.continueTexts;
    newContinueTexts.push(`${this.state.opponent.name} is defeated!`);
    this.setState({
      opponent: null,
    });
  }

  catchOpponent() {
    const captured = Math.random() / 2 > this.state.opponent.hp / this.state.opponent.maxhp;
    const newContinueTexts = this.state.continueTexts;
    if (captured) {
      newContinueTexts.unshift(`${this.state.opponent.name} was caught!`);
      const newSprites = this.state.sprites.concat([this.state.opponent]);
      this.setState({
        sprites: newSprites,
        opponent: null,
        continueTexts: newContinueTexts,
      });
    } else {
      newContinueTexts.unshift(`You couldn't catch ${this.state.opponent.name}!`);
      this.setState({
        continueTexts: newContinueTexts,
        playerTurn: false,
      });
    }
  }

  placeholderAttack(attack) {
    const newOpponent = Object.assign({}, this.state.opponent);
    let damage = attack.damage * this.getActiveSprite().level;
    damage = Math.floor(damage * (Math.random() + 0.5));
    newOpponent.hp -= damage;
    const levelUpTime = Math.random() < ((newOpponent.level / this.getActiveSprite().level) / 2);
    const newContinueTexts = this.state.continueTexts;
    newContinueTexts.unshift(`${this.getActiveSprite().name} used ${attack.name} for ${damage} damage!`);
    if (newOpponent.hp <= 0 && levelUpTime) {
      this.levelUp();
    } else if (newOpponent.hp <= 0) {
      this.endBattle();
    } else {
      this.setState({ opponent: newOpponent, continueTexts: newContinueTexts, playerTurn: false });
    }
  }

  opponentAttack() {
    const attack = randomChoice(this.state.opponent.moves);
    let opponentDamage = attack.damage;
    opponentDamage = Math.floor(opponentDamage * (Math.random() + 0.5));
    const newActiveSprite = this.getActiveSprite();
    const newContinueTexts = this.state.continueTexts.slice(1);
    newContinueTexts.unshift(`${this.state.opponent.name} used ${attack.name} for ${opponentDamage} damage!`);
    newActiveSprite.hp -= opponentDamage;
    const newSprites = this.state.sprites.slice();
    newSprites[this.state.activeSprite] = newActiveSprite;
    this.setState({ sprites: newSprites, continueTexts: newContinueTexts, playerTurn: true });
  }

  levelUp() {
    const newSprite = Object.assign({}, this.getActiveSprite());
    newSprite.level += 1;
    const newSprites = this.state.sprites.slice();
    newSprites[this.state.activeSprite] = newSprite;
    this.setState({ sprites: newSprites });
    this.endBattle();
  }

  viewDen() {
    this.setState({
      viewingDen: true,
    });
  }

  switchSprite(i) {
    this.setState({
      viewingDen: false,
      activeSprite: i,
    });
  }

  getActiveSprite() {
    return this.state.sprites[this.state.activeSprite];
  }

  continue() {
    const newTexts = this.state.continueTexts.slice(1);
    if (newTexts.length < 1 && !this.state.playerTurn) {
      this.opponentAttack();
    } else {
      this.setState({
        continueTexts: newTexts,
      });
    }
  }

  render() {
    return (
      <div className="App" style={{
        backgroundImage: `url(/img/backgrounds/${this.state.area}.jpg)`,
      }}>
        <SpriteImage sprite={this.getActiveSprite()} />
        <button onClick={ this.startBattle }>
          Keep adventuring!
        </button>
        <button onClick={ this.viewDen }>
          Switch sprite
        </button>
        { this.state.viewingDen ?
          <Den
            sprites={ this.state.sprites }
            switchSprite={ this.switchSprite }
          />
        : ''
        }
        { this.state.opponent || this.state.continueTexts.length > 0 ?
          <Battle
            area={ this.state.area }
            activeSprite={ this.getActiveSprite() }
            opponent={ this.state.opponent }
            onAttack={ this.placeholderAttack }
            opponentAttack={ this.opponentAttack }
            onFlee={ this.flee }
            onCatch={ this.catchOpponent }
            continueTexts= { this.state.continueTexts }
            continue = { this.continue }
            clickAfterWait = { this.clickAfterWait }
          /> : ''
        }
      </div>
    );
  }
}

export default App;
