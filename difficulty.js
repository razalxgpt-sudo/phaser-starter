class AdaptiveAI {
    constructor(){
        this.difficulty = 1;
    }

    update(performance){
        if(performance > 0.8) this.difficulty++;
        if(performance < 0.4) this.difficulty--;
        this.difficulty = Math.max(1,this.difficulty);
    }
}
