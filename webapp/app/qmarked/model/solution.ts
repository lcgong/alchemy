
// export class Solution {
//   constructor(result) {
//     this.blank = null;
//     this.result = result;
//   }
//
// };

export class Notes {
  private _question: any;
  public boundBlanks: any[];
  public textLineRange: any;

  constructor(question: any) {
    this._question = question;
    this.boundBlanks = [];
    // this.solutions = [];
  }

  // makeSolution(solution) {
  //   let obj = new Solution(solution);
  //   this.solutions.push(obj);
  //   return obj;
  // }
};
