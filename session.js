class SaveManager {
    static save(key,data){
        localStorage.setItem(key,JSON.stringify(data));
    }

    static load(key){
        return JSON.parse(localStorage.getItem(key));
    }
}
