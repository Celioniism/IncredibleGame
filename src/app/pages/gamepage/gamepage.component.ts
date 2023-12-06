import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

@Component({
  selector: 'app-gamepage',
  templateUrl: './gamepage.component.html',
  styleUrls: ['./gamepage.component.css'],
})
export class GamepageComponent {
  pointModifier: number = 1;

  overFullModifier: number = 0.6;

  level: number = 0;

  overallModifier: number = 0;

  pointsToLevelUp: number = 100;

  points = 0;

  fullness: number = 0;

  overFull: boolean = false;

  messageQueue: string[] = [];

  foodPaths: string[] = [
    '../../../assets/Images/foodStuffs/cookie.png',
    '../../../assets/Images/foodStuffs/hotdog.png',
    '../../../assets/Images/foodStuffs/croissant.png',
  ];

  foodPrices: number[] = [15, 35, 22];

  foodInventory: string[] = ['cookie', 'hotDog', 'croissant', 'croissant'];

  belly: string[] = [];

  foodDictionary = {
    cookie: {
      index: 0,
      fullness: 10,
    },
    hotDog: {
      index: 1,
      fullness: 25,
    },
    croissant: {
      index: 2,
      fullness: 15,
    },
  };
  sprite: HTMLElement | null | undefined;
  fullnessInterval: any;
  shopOpen: boolean = false;
  clickers: any[] = [];
  clickerMod: number = 1;
  constructor() {
    this.points = JSON.parse(<string>localStorage.getItem('points')) ?? 0;
    this.level = JSON.parse(<string>localStorage.getItem('level')) ?? 0;
    this.pointsToLevelUp =
      JSON.parse(<string>localStorage.getItem('pointsToLevelUp')) ?? 100;
    this.overallModifier =
      JSON.parse(<string>localStorage.getItem('overallModifier')) ?? 0;
    this.pointModifier =
      JSON.parse(<string>localStorage.getItem('pointModifier')) ?? 1;
  }
  ngOnInit() {
    // set sprite element variable to select later and add components to
    this.sprite = <HTMLElement>document.getElementById('sprite');
    // begin hunger thread on init
    this.hungerThread();
  }

  // Hunger Functions //
  async hungerThread() {
    // sets an interval for the decrease fullness algorithm to run
    this.fullnessInterval = setInterval(() => {
      // every 2 seconds the decrease fullness algorithm executes
      this.decreaseFullness();
    }, 2000);
  }

  // this algorithm will chek current fullness and assign the modifier based on it. then it will decrease fullness by one
  decreaseFullness() {
    switch (true) {
      case this.fullness > 80 && this.fullness < 100: {
        this.pointModifier = this.overallModifier + 1 * 1.75 * (this.level + 1);
        break;
      }
      case this.fullness > 60 && this.fullness < 80: {
        this.pointModifier = this.overallModifier + 1 * 1.6 * (this.level + 1);
        break;
      }
      case this.fullness > 40 && this.fullness < 60: {
        this.pointModifier = this.overallModifier + 1 * 1.4 * (this.level + 1);
        break;
      }
      case this.fullness > 0 && this.fullness < 40: {
        this.pointModifier = this.overallModifier + 1 * 1.1 * (this.level + 1);
        break;
      }
      default: {
        break;
      }
    }
    // decrease only if not 0
    if (this.fullness != 0) {
      this.fullness -= 1;
    }
  }

  // Clicking Functions //
  // multiply and set fixed digits
  decimalmultiply(a: number, b: number): number {
    return parseFloat((a * b).toFixed(2));
  }
  //runs whenever charachter is clicked, calcultes what to add by and adds a point
  addPoint(clicker?: boolean) {
    if (!!clicker) {
      var clickerpointModifier = parseInt(
        (this.pointModifier * this.clickerMod).toFixed(2)
      );
      var toAdd: number = clickerpointModifier * (this.overallModifier + 1);
    } else {
      var toAdd: number = this.pointModifier * (this.overallModifier + 1);
    }
    this.points += toAdd;
    this.points = this.decimalmultiply(this.points, 1);
    // levels up the user if the points add up to the current point limit or more, adds to modifiers, point limit, and level
    if (this.points >= this.pointsToLevelUp) {
      this.pointsToLevelUp += this.pointsToLevelUp * 4;
      this.level += 1;
      this.overallModifier += 0.3;
    }
    if (this.sprite != null) {
      // creates a new dom element with a set ID of points
      this.sprite.insertAdjacentHTML(
        'afterend',
        '<div style="width:1px; overflow:shown" id="' +
          this.points +
          '"> +' +
          toAdd.toFixed(2) +
          '</div>'
      );
      // grabs the element by the id just set in order to alter it
      var newdiv: HTMLElement = <HTMLElement>(
        document.getElementById(this.points + '')
      );
      // animates the new div to float upwards
      newdiv.animate(
        [
          {
            transform: 'translate(180px,120px)',
            opacity: '1',
            'font-family': 'sans-serif',
          },
          {
            transform: 'translate(180px,-240px)',
            opacity: '0',
            'font-family': 'sans-serif',
          },
        ],
        {
          // timing options
          duration: 700,
          iterations: 1,
        }
      );

      // removes the div element from the DOM once the timer expires as to not clutter the DOM with elements
      setTimeout(() => {
        newdiv.remove();
      }, 700);
    }
    localStorage.setItem('points', JSON.stringify(this.points));
    localStorage.setItem('level', JSON.stringify(this.level));
    localStorage.setItem(
      'pointsToLevelUp',
      JSON.stringify(this.pointsToLevelUp)
    );
    localStorage.setItem(
      'overallModifier',
      JSON.stringify(this.overallModifier)
    );
    localStorage.setItem('pointModifier', JSON.stringify(this.pointModifier));
  }

  // Shop Functions //

  // user buys a new auto clicker, this sets a new clicker to run.
  addAutoClicker(price: number) {
    if (this.points - price < 0 && this.clickers.length > 9) {
      return;
    }
    this.points -= price;
    this.points = this.decimalmultiply(this.points, 1);
    // runs clicker function
    this.clicker();
  }

  // checks if max clicker reached to prevent lag and to even out gameplay, pushes a new clicker with
  // an interval that will run the "addPoint" function for the user every 2 seconds
  clicker() {
    this.clickers.push(
      setInterval(() => {
        this.addPoint(true);
      }, 2000)
    );
  }
  // adds .5 points to the auto clicker modifier
  changeClickerMod(price: number) {
    if (this.points - price < 0) {
      return;
    }
    this.points -= price;
    this.clickerMod += 0.5;
  }

  // open and close the shop, depends on ngIf to render elements on the DOM
  openShop() {
    this.shopOpen = true;
  }

  closeShop() {
    this.shopOpen = false;
  }
  // parses the keys of the food dictionary and grabs their position and returns their name.
  numberParser = (json: any, i: number) => {
    var keys = Object.keys(json);
    return { key: keys[i].toString() };
  };
  // buy food from the market, this pulls the position in the PNG array of the food and calls the number parser to grab the food name.
  buyFood(price: number, item: number) {
    if (this.points - price < 0) {
      return;
    }
    this.points -= price;
    this.points = this.decimalmultiply(this.points, 1);
    // gets the name of the food
    var food = this.numberParser(this.foodDictionary, item);
    // adds the food to the food inventory
    this.foodInventory.push(food.key);
  }

  // Feed Functions //
  feed(snack: string) {
    type ObjectKey = keyof typeof this.foodDictionary;
    const sn = snack as ObjectKey;
    var modifier = this.foodDictionary[sn].fullness;
    if (this.fullness > 100) {
      this.queueModify('Too Full To Eat!!');
      return;
    } else if (this.fullness + modifier > 100) {
      this.pointModifier = this.overFullModifier;
      this.overFull = true;
    }
    this.fullness += modifier;
    this.belly.shift();
  }

  queueModify(message: string) {
    this.messageQueue.push(message);
    if (this.messageQueue.length > 5) {
      this.messageQueue.shift();
    }
  }

  drop(event: CdkDragDrop<string[], any, any>) {
    if (event.previousContainer === event.container || this.fullness > 100) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.feed(event.container.data[0]);
    }
  }

  // HTML Functions //

  getPath(item: string): string {
    type ObjectKey = keyof typeof this.foodDictionary;
    const sn = item as ObjectKey;
    var index = this.foodDictionary[sn].index;
    return this.foodPaths[index];
  }

  getNutrition(item: string): number {
    type ObjectKey = keyof typeof this.foodDictionary;
    const sn = item as ObjectKey;
    var fullness = this.foodDictionary[sn].fullness;
    return fullness;
  }

  getNutritionStore(item: number): number {
    var keys = Object.keys(this.foodDictionary);
    type ObjectKey = keyof typeof this.foodDictionary;

    const key = keys[item] as ObjectKey;
    var nutrition = this.foodDictionary[key].fullness;
    return nutrition;
  }
}
