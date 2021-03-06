const nicknameInput: HTMLInputElement = document.querySelector('input#nickname');
const errorLabel: HTMLLabelElement = document.querySelector('label#error');
const messageInput: HTMLInputElement = document.querySelector('input#message');


// div sections
const landingPageSection: HTMLElement = document.querySelector('div#landingPageSection');
const chatSection: HTMLElement = document.querySelector('div#chatSection');

function setSectionVisible(section: HTMLElement) {

    // set all sections to invisible
    landingPageSection.style.display = "none";
    chatSection.style.display = "none";

    // set the section below to visible
    section.style.display = "flex";
}

class WsSignaller {
    private wsConnection: WebSocket;
    private nickname: String;

    constructor(nickname: String) {
        this.nickname = nickname;
    }

    public connect() {
        let wsUri = (window.location.protocol === 'https:' && 'wss://' || 'ws://') + window.location.host + '/ws/' + this.nickname;
        console.log('ws connecting to: ' + wsUri);

        let wsConnection = new WebSocket(wsUri);
        this.wsConnection = wsConnection;

        wsConnection.onopen = this.onopen;
        wsConnection.onmessage = e => this.onmessage(e);
        wsConnection.onclose = e => console.log('ws disconnected');
    }

    public reconnect() {
        if (this.wsConnection != null && this.wsConnection.readyState == WebSocket.CLOSED) {
            console.log("reconnecting ws");
            this.connect();
        }
    }

    public send(msg: string) {
        if (this.wsConnection != null && this.wsConnection.readyState == WebSocket.OPEN) {
            this.wsConnection.send(msg);
        }
    }

    private onopen(e: Event) {
        let _wsConnection = e.currentTarget as WebSocket;
        console.log('ws connected');
        setSectionVisible(chatSection);
    }

    private onmessage(e: MessageEvent) {
        console.log('ws received: ' + e.data);
    }
}

let ws = new WsSignaller("nobody");

function connectClick() {
    let nickname = nicknameInput.value;
    console.log(nickname);
    if (nickname == null || nickname.length < 3 || nickname.length > 10) {
        errorLabel.innerHTML = "Please enter a valid nickname<br>between 3 and 10 chars"
        return;
    }

    errorLabel.innerHTML = null;
    ws = new WsSignaller(nickname);
    ws.connect();
}

function messageChanged() {
    let msg = messageInput.value;
    console.log(msg);

    if (msg == null || msg.length == 0 || msg.length > 100) {
        // log out of range
        return;
    }

    ws.send(msg);
    messageInput.value = null;
}

window.onfocus = () => {
    ws.reconnect();
}