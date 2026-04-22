class DifficultyManager {
    constructor(){
        this.level = 1;
    }

    set(level){
        this.level = level;
    }

    get(){
        return this.level;
    }
}
