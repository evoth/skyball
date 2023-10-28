export default class Socket {
  isConnected: boolean = false;
  ws: WebSocket;
  url: string;
  data: any;

  connect() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let host = urlParams.get("host");
    host = host || "localhost";
    this.url = `ws://${host}:7777`;

    let that = this;
    if ("WebSocket" in window) {
      this.ws = new WebSocket(this.url);
    } else {
      console.log("This Browser does not support WebSockets");
      return;
    }
    this.ws.onopen = function (e) {
      console.log("Client: A connection to " + this.url + " has been opened.");
      that.isConnected = true;
    };

    this.ws.onerror = function (e) {
      console.log(
        "Client: An error occured, see console log for more details."
      );
      console.log(e);
    };

    this.ws.onclose = function (e) {
      console.log(
        "Client: The connection to " +
          this.url +
          " was closed. [" +
          e.code +
          (e.reason != "" ? "," + e.reason : "") +
          "]"
      );
      that.isConnected = false;
    };

    this.ws.onmessage = function (e) {
      that.data = JSON.parse(e.data);
    };
  }

  disconnect() {
    this.ws.close();
  }

  toggle_connect() {
    if (!this.isConnected) {
      this.connect();
    } else {
      this.disconnect();
    }
  }
}
