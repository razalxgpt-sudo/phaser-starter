class PlayerProfile {
    constructor(){
        this.score = 0;
        this.level = 1;
    }

    save(){
        localStorage.setItem('mindflow_profile', JSON.stringify(this));
    }

    load(){
        const data = localStorage.getItem('mindflow_profile');
        if(data){
            Object.assign(this, JSON.parse(data));
        }
    }
}
