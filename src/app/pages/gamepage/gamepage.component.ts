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
  ngOnInit() {
    this.sprite = <HTMLElement>document.getElementById('sprite');
    this.hungerThread();
  }

  async hungerThread() {
    this.fullnessInterval = setInterval(() => {
      this.decreaseFullness();
    }, 2000);
  }

  decreaseFullness() {
    switch (true) {
      case this.fullness > 80 && this.fullness < 100: {
        this.pointModifier = this.overallModifier + 1 * 1.75;
        break;
      }
      case this.fullness > 60 && this.fullness < 80: {
        this.pointModifier = this.overallModifier + 1 * 1.6;
        break;
      }
      case this.fullness > 40 && this.fullness < 60: {
        this.pointModifier = this.overallModifier + 1 * 1.4;
        break;
      }
      case this.fullness > 0 && this.fullness < 40: {
        this.pointModifier = this.overallModifier + 1 * 1.1;
        break;
      }
      default: {
        break;
      }
    }
    if (this.fullness != 0) {
      this.fullness -= 1;
    }
  }

  decimalmultiply(a: number, b: number): number {
    return parseFloat((a * b).toFixed(2));
  }
  addPoint() {
    var toAdd: number = this.pointModifier * (this.overallModifier + 1);

    this.points += toAdd;
    this.points = this.decimalmultiply(this.points, 1);
    if (this.points > this.pointsToLevelUp) {
      this.points = 0;
      this.pointsToLevelUp = this.pointsToLevelUp * 4;
      this.level += 1;
      this.overallModifier += 0.3;
    }
    if (this.sprite != null) {
      this.sprite.insertAdjacentHTML(
        'afterend',
        '<div id="' + this.points + '">' + toAdd + '</div>'
      );
      var newdiv: HTMLElement = <HTMLElement>(
        document.getElementById(this.points + '')
      );

      newdiv.animate(
        [
          {
            transform: 'translate(80px,0px)',
            opacity: '1',
            'font-family': 'sans-serif',
          },
          {
            transform: 'translate(80px,-300px)',
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
      setTimeout(() => {
        newdiv.remove();
      }, 700);
    }
  }

  levelUpAlgo() {}

  addLevelAlgo() {}

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
  getPath(item: string): string {
    type ObjectKey = keyof typeof this.foodDictionary;
    const sn = item as ObjectKey;
    var index = this.foodDictionary[sn].index;
    return this.foodPaths[index];
  }
}
