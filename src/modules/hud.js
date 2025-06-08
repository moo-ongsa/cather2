export class Hud {
  static lineheight = 15;

  constructor({ room, userId, userPeerId, canvasContext, canvas }) {
    this.room = room || "";
    this.userId = userId || "";
    this.userPeerId = userPeerId || "";
    this.lineheight = 15;
    this.canvasContext = canvasContext;
    this.canvas = canvas;
  }

  draw() {
    if (this.canvasContext) {
      let x,
        y = 15;

      const text = `room_id: ${this.room}
          user_id: ${this.userId}
          user_peer_id: ${this.userPeerId}
          `;

      var lines = text.replace(/^\s+|\s+$/gm, "").split("\n");

      this.canvasContext.fillStyle = "rgba(125,125,255,0.5)";
      this.canvasContext.fillRect(
        0,
        0,
        this.canvas.width,
        y / 2 + this.lineheight * lines.length
      );
      this.canvasContext.font = "15px sans-serif";
      this.canvasContext.fillStyle = "#fff";
      this.canvasContext.textAlign = "start";

      for (let i = 0; i < lines.length; i++) {
        this.canvasContext.fillText(lines[i], 15, y + i * this.lineheight);
      }
    }
  }

  clearHud() {
    this.room = "";
    this.userId = "";
    this.userPeerId = "";
  }
}
