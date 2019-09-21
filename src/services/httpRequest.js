class HttpRequest {
    constructor() {
        if(process.env.REACT_APP_ENV !== "production") {
            this.server = 'http://localhost:4200'
        } else {
            this.server = '';
        }
    }

    postHTTP(data, path) {
        return fetch(`${this.server}/${path}`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: { 'Content-type' : 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {return res.json()});
    }
}

export let httpRequest = new HttpRequest();