"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { Peer } from "peerjs";
import { io } from "socket.io-client";
import { COLLISIONS } from "@/data/collisions";
import { MEETING_1_ZONE, MEETING_2_ZONE } from "@/data/meetingZone";
import { useLocalStorage, useWindowSize } from "@/utils/hooks";
import { LOCAL_STORAGE } from "@/utils/constants";
import { Boundary } from "@/modules/boundary";
import { Sprite } from "@/modules/sprite";
import { Hud } from "@/modules/hud";
import api from "@/utils/api";

export default function Page({ params }) {
  const { roomId } = params;
  const canvasRef = useRef(null);
  const { width, height } = useWindowSize();
  const [videoList, setVideoList] = useState([]);
  const inX = useRef({
    zone1: false,
    zone2: false,
  });
  const hudRef = useRef(new Hud({}));
  var socket = io("http://localhost:8000");
  var xDown = null;
  var yDown = null;
  // useEffect(() => socketInitializer(), []);

  // const socketInitializer = async () => {
  //   // await api.get("socket");
  //   // socket = io();

  //   // socket.on("connect", () => {
  //   //   console.log("connected");
  //   // });
  // };

  useEffect(() => {
    fetch("/api/socket");
  }, []);

  console.log("🚀 ~ file: page.js:15 ~ Page ~ socket:", socket);
  const [localStorageOffset, setLocalStorageOffset] = useLocalStorage(
    LOCAL_STORAGE.OFFSET,
    {
      x: -800,
      y: -900,
    }
  );
  // const backgroundImage = new Image();
  // backgroundImage.src = "../../../../public/img/cather_style_map.png";
  // console.log(
  //   "🚀 ~ file: page.js:24 ~ Page ~ backgroundImage:",
  //   backgroundImage
  // );

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const canvas = canvasRef.current;
  //     setCanvas(canvas);
  //     canvas.width = 1000;
  //     canvas.height = window.innerHeight;
  //   }
  // }, [canvasRef]);

  //mock users
  const users = { 1: {} };
  const CURRENT_USER_ID = 1;

  const handleJoin = () => {
    socket.emit("join_room", roomId);
  };

  const peers = useRef({});
  var currentUserPeerId = "";
  var currentUserVideoStreamId = "";

  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  function connectViaPeer(zone) {
    // const myPeer = new Peer(undefined, {
    //   secure: true,
    //   host: "catherpeerjs.netlify2.app",
    //   path: "/cather",
    //   port: 9000,
    // });
    const myPeer = new Peer(undefined);
    console.log("🚀 ~ file: script.js:37 ~ connectViaPeer ~ myPeer:", myPeer);
    // const myPeer = new Peer();
    const myVideo = document.createElement("video");
    myVideo.muted = true;

    socket.on("user-disconnected", (userPeerId) => {
      console.log("🚀 ~ socket.on ~ userPeerId:", userPeerId);
      // console.log(
      //   "🚀 ~ user-disconnected userPeerId",
      //   userPeerId,
      //   " peers",
      //   peers
      // );

      if (peers.current[userPeerId]) {
        peers.current[userPeerId].close();
        // delete peers[userPeerId]
      }
    });

    myPeer.on("open", (id) => {
      console.log("🚀 ~ file: script.js ~ line 38 ~ connectViaPeer ~ id", id);
      socket.emit("join-room", `${roomId}-${zone}`, id);
      currentUserPeerId = id;
      hudRef.current.userPeerId = id;
      // hud.userPeerId = id;
      // hud.userId = CURRENT_USER_ID;
      // hud.userPeerId = id;
      // hud.room = `${ROOM_ID}-${zone}`;
    });

    myPeer.on("exitRoom", (id) => {
      console.log("AMINO OK");
    });

    socket.on("test", (userPeerId) => {
      // console.log("🚀 ~test", userPeerId);
      // connectToNewUser(userPeerId, stream)
    });

    myPeer.on("connection", (event) => {
      // console.log(
      //   "🚀 ~ file: script.js ~ line 77 ~ connectViaPeer ~ event",
      //   event
      // );
    });

    console.log("🚀 ~ connectViaPeer ~ navigator:", navigator);
    if (!navigator.mediaDevices && !navigator.mediaDevices?.getUserMedia) {
      navigator.userMedia = navigator.mozGetUserMedia || navigator.getUserMedia;
      if (!navigator.userMedia) {
        alert("Please Update or Use Different Browser");
        return;
      }
      // navigator.userMedia(
      //   {
      //     video: true,
      //   },
      //   (stream) => showCam(stream),
      //   (err) => showErr(err)
      // );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(myVideo, stream);
        currentUserVideoStreamId = stream.id;

        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            console.log("[MYPEER] stream");
            addVideoStream(video, userVideoStream);
          });

          call.on("close", () => {
            console.log("[MYPEER] close");
            video.remove();
          });
          peers.current[call.peer] = call;
        });

        socket.on("user-connected", (userPeerId) => {
          console.log("🚀 ~ [STEP-1] user-connected", userPeerId);
          connectToNewUser(userPeerId, stream);
        });

        socket.on("user-exit-room", async (userPeerId) => {
          console.log("🚀 ~ file: exit room", userPeerId);
          console.log("peer", peers.current);

          if (peers.current[userPeerId]) {
            peers.current[userPeerId].close();
            delete peers.current[userPeerId];
          }
          if (userPeerId === currentUserPeerId) {
            // await dataConnection.close()
            // await socket.disconnect()
            // await socket.connect()
            myPeer.disconnect();

            // await myPeer.destroy();

            // await myPeer.reconnect()
          }
          removeVideoStream(userPeerId);
          // connectToNewUser(userPeerId, stream);
        });
      });

    function showCam(stream) {
      let video = document.querySelector("video");
      video.srcObject = stream;
    }

    function showErr(err) {
      let message =
        err.name === "NotFoundError"
          ? "Please Attach Camera"
          : err.name === "NotAllowedError"
          ? "Please Grant Permission to Access Camera"
          : err;
      alert(message);
    }

    async function connectToNewUser(userPeerId, stream) {
      console.log("🚀 ~ [STEP2] myPeer", myPeer);
      console.log("WWW1,", stream.id);
      // await myPeer.reconnect()
      if (myPeer._disconnected) {
        // await myPeer.reconnect();
      } else {
        const call = myPeer.call(userPeerId, stream);
        console.log("🚀 ~ [STEP3] userPeerId", userPeerId);
        console.log("🚀 ~ [STEP4] call", call);
        const video = document.createElement("video");
        call.on("stream", (stream) => {
          console.log("WWW2,", stream.id);

          console.log("[STEP5] stream", stream);
          console.log("[STEP6] videoList", videoList);
          // setVideoList([...videoList, { src: stream, id: stream.id }]);

          addVideoStream(userPeerId, stream);
        });
        call.on("close", () => {
          console.log("🚀 ~ [STEP7] close", stream);
          removeVideoStream(userPeerId);
          // video.remove();
        });
        peers.current[userPeerId] = call;
      }
    }

    function addVideoStream(userPeerId, stream) {
      setVideoList((prevVideoList) => {
        if (prevVideoList.map(({ id }) => id).includes(stream.id)) {
          return prevVideoList;
        }
        return [...prevVideoList, { src: stream, id: stream.id, userPeerId }];
      });
      // video.srcObject = stream;
      // video.id = stream.id;
      // console.log("play");
      // video.addEventListener("loadedmetadata", () => {
      //   console.log("play");
      //   video.play();
      // });
      // const videoGrid = document.getElementById("video-grid");
      // console.log(
      //   "🚀 ~ file: page.js:234 ~ addVideoStream ~ videoGrid:",
      //   videoGrid
      // );
      // videoGrid.append(video);
    }

    function removeVideoStream(userPeerId) {
      setVideoList((prevVideoList) => {
        console.log("🚀 ~ removeVideoStream ~ removeId:", userPeerId);
        console.log("🚀 ~ setVideoList ~ prevVideoList:", prevVideoList);
        return prevVideoList.filter((video) => video.userPeerId !== userPeerId);

        if (prevVideoList.map(({ id }) => id).includes(stream.id)) {
          return prevVideoList;
        }
        return [...prevVideoList, { src: stream, id: stream.id }];
      });
    }
  }

  async function disconnectCurrentUser(zone) {
    setVideoList([]);

    // const videoGrid = document.getElementById("video-grid");
    // while (videoGrid.firstChild) {
    //   videoGrid.removeChild(videoGrid.lastChild);
    // }

    console.log("moo ja hana ka");
    socket.emit("exit-room");
    // await socket.disconnect()
    // await socket.connect()
    // hud.clearHud();
    // peers = {}

    // DataConnection.close()
  }

  useEffect(() => {
    const canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("🚀 ~ file: page.js:54 ~ useEffect ~ canvas:", canvas);
    const canvasContext = canvas.getContext("2d");

    const offset = {
      x: localStorageOffset?.x, //-800 default
      y: localStorageOffset?.y, //-700 default,
    };
    console.log("🚀 ~ useEffect ~ offset:", offset);
    console.log(
      "🚀 ~ useEffect ~ offset.localStorageOffset:",
      localStorageOffset
    );

    const backgroundImage = new Image();
    backgroundImage.src = "/img/cather_style_map.png"; // Relative path from the public directory

    const playerDownImage = new Image();
    playerDownImage.src = "/img/cat_walk_down.png";

    const playerUpImage = new Image();
    playerUpImage.src = "/img/cat_walk_up.png";

    const playerLeftImage = new Image();
    playerLeftImage.src = "/img/cat_walk_left.png";

    const playerRightImage = new Image();
    playerRightImage.src = "/img/cat_walk_right.png";

    const foregroundImage = new Image();
    foregroundImage.src = "/img/cather_style_foreground_map.png";

    const backgroundWater1Image = new Image();
    backgroundWater1Image.src = "/img/cather_style_water_1_map.png";

    const backgroundWater2Image = new Image();
    backgroundWater2Image.src = "/img/cather_style_water_2_map.png";

    const backgroundWater3Image = new Image();
    backgroundWater3Image.src = "/img/cather_style_water_3_map.png";

    const backgroundWater4Image = new Image();
    backgroundWater4Image.src = "/img/cather_style_water_4_map.png";

    const background = new Sprite({
      canvasContext,
      position: {
        x: offset.x,
        y: offset.y,
      },
      image: backgroundImage,
    });

    const player = new Sprite({
      canvasContext,
      position: {
        x: canvas.width / 2 - 256 / 4 / 2,
        y: canvas.height / 2 - 64 / 2,
        // x: canvas.width / 2 - 256 ,
      },
      image: playerDownImage,
      frames: { max: 4 },
      sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage,
      },
      userId: "",
    });

    //inintial data
    let lastKey = "";
    let keyPressed = "";
    let waterAnimationTimeframe = 0;
    let inAreaMeeting1Zone = false;
    let inAreaMeeting2Zone = false;
    let inMeeting = {
      zone1: false,
      zone2: false,
    };
    const tiles = 58;
    const conllisionsMap = []; //cather_style_map width tiles = 58
    const meeting1ZoneMap = [];
    const meeting2ZoneMap = [];
    const boundaries = [];
    const meeting1Zone = [];
    const meeting2Zone = [];

    console.log("🚀 ~ file: page.js:68 ~ Page ~ offset:", offset);

    const keys = {
      w: {
        pressed: false,
      },
      a: {
        pressed: false,
      },
      s: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
    };

    for (let i = 0; i < COLLISIONS.length; i += tiles) {
      conllisionsMap.push(COLLISIONS.slice(i, tiles + i));
    }

    for (let i = 0; i < MEETING_1_ZONE.length; i += tiles) {
      meeting1ZoneMap.push(MEETING_1_ZONE.slice(i, tiles + i));
    }

    for (let i = 0; i < MEETING_2_ZONE.length; i += tiles) {
      meeting2ZoneMap.push(MEETING_2_ZONE.slice(i, tiles + i));
    }

    conllisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 236) {
          boundaries.push(
            new Boundary({
              canvasContext,
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y,
              },
            })
          );
        }
      });
    });

    meeting1ZoneMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 236) {
          meeting1Zone.push(
            new Boundary({
              canvasContext,
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y,
              },
            })
          );
        }
      });
    });

    meeting2ZoneMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 236) {
          meeting2Zone.push(
            new Boundary({
              canvasContext,
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y,
              },
            })
          );
        }
      });
    });

    const players = Object.assign({}, users);
    for (const [key, userSprite] of Object.entries(players)) {
      players[key] = new Sprite({
        canvasContext,
        ...userSprite,
        position: player.position,
        frames: player.frames,
        image: player.image,
        sprites: player.sprites,
        width: player.width + 100,
        height: player.height + 100,
      });
    }

    const foreground = new Sprite({
      canvasContext,
      position: {
        x: offset.x,
        y: offset.y,
      },
      image: foregroundImage,
    });

    const water = new Sprite({
      canvasContext,
      position: {
        x: offset.x,
        y: offset.y,
      },
      image: backgroundWater1Image,
      sprites: {
        water1: backgroundWater1Image,
        water2: backgroundWater2Image,
        water3: backgroundWater3Image,
        water4: backgroundWater4Image,
      },
    });

    hudRef.current.canvasContext = canvasContext;
    hudRef.current.canvas = canvas;
    hudRef.current.room = roomId;
    // const hud = new Hud({
    //   canvasContext,
    //   canvas,
    //   room: roomId,
    //   userId: "",
    // });

    const playerMovement = {
      up: () => {
        movables.forEach((movable) => {
          movable.position.y += 3;
        });
      },
      upAndRight: () => {
        movables.forEach((movable) => {
          movable.position.y += 2;
          movable.position.x -= 2;
        });
      },
      upAndLeft: () => {
        movables.forEach((movable) => {
          movable.position.y += 2;
          movable.position.x += 2;
        });
      },
      down: () => {
        movables.forEach((movable) => {
          movable.position.y -= 3;
        });
      },
      downAndRight: () => {
        movables.forEach((movable) => {
          movable.position.y -= 2;
          movable.position.x -= 2;
        });
      },
      downAndLeft: () => {
        movables.forEach((movable) => {
          movable.position.y -= 2;
          movable.position.x += 2;
        });
      },
      left: () => {
        movables.forEach((movable) => {
          movable.position.x += 3;
        });
      },
      right: () => {
        movables.forEach((movable) => {
          movable.position.x -= 3;
        });
      },
    };

    function waterAnimation() {
      water.image =
        water.sprites["water" + ((waterAnimationTimeframe % 4) + 1)];
      waterAnimationTimeframe++;
      setTimeout(waterAnimation, 1000);
    }

    function rectangularCollision({ rectangle1, rectangle2 }) {
      return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.width >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
      );
    }

    function checkBoundaries(boundaries) {
      let moving = true;
      //   player.moving = true;
      players[CURRENT_USER_ID].moving = true;
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        const position = {
          x:
            boundary.position.x +
            (keys.a.pressed ? 3 : keys.d.pressed ? -3 : 0),
          y:
            boundary.position.y +
            (keys.w.pressed ? 3 : keys.s.pressed ? -3 : 0),
        };
        if (
          rectangularCollision({
            // rectangle1: player,
            rectangle1: players[CURRENT_USER_ID],
            rectangle2: {
              ...boundary,
              position,
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      return moving;
    }

    function checkMeetingZone(meetingZone) {
      let inAreaMeetingZone = false;
      for (let i = 0; i < meetingZone.length; i++) {
        const meeting = meetingZone[i];
        const position = {
          x:
            meeting.position.x + (keys.a.pressed ? 3 : keys.d.pressed ? -3 : 0),
          y:
            meeting.position.y + (keys.w.pressed ? 3 : keys.s.pressed ? -3 : 0),
        };
        if (
          rectangularCollision({
            // rectangle1: player,
            rectangle1: players[CURRENT_USER_ID],
            rectangle2: {
              ...meeting,
              position,
            },
          })
        ) {
          inAreaMeetingZone = true;
          break;
        }
      }

      return inAreaMeetingZone;
    }

    const movables = [
      background,
      ...boundaries,
      foreground,
      water,
      ...meeting1Zone,
      ...meeting2Zone,
      //   ...Object.values(otherUser),
    ];

    function animate() {
      window.requestAnimationFrame(animate);
      water.draw();
      background.draw();
      boundaries.forEach((boundary) => {
        boundary.draw();
      });
      meeting1Zone.forEach((meetingZone) => {
        meetingZone.draw();
      });
      meeting2Zone.forEach((meetingZone) => {
        meetingZone.draw();
      });

      //   console.log("🚀 ~ file: game.js ~ line 341 ~ players.forEach ~ players", players)

      //   player.draw();
      //   players.forEach((user) => {
      //     user.draw();
      //   });
      //   console.log("🚀 ~ file: game.js ~ line 345 ~ animate ~ players", players);
      //   console.log(`OK ${otherUser}`);

      for (const [key, userSprite] of Object.entries(players)) {
        try {
          userSprite.draw();
        } catch (error) {
          console.error(error);
          // typeof updatedUserVelocity === "function" &&
          //   updatedUserVelocity(CURRENT_USER_ID, player);
        }
      }
      // monster.draw();

      foreground.draw();
      hudRef.current.draw();

      let moving = true;
      inAreaMeeting1Zone = checkMeetingZone(meeting1Zone);
      inAreaMeeting2Zone = checkMeetingZone(meeting2Zone);

      // canvasContext.drawImage(playerDownImage, 10, 10, 64, 64, 200, 64, 64, 64);

      //   player.moving = false;
      players[CURRENT_USER_ID].moving = false;

      if (
        keys.w.pressed ||
        keys.a.pressed ||
        keys.s.pressed ||
        keys.d.pressed
      ) {
        if (keys.w.pressed && ["w", "wd", "wa"].includes(lastKey)) {
          moving = checkBoundaries(boundaries);
          // player.image = player.sprites.up;
          players[CURRENT_USER_ID].image = players[CURRENT_USER_ID].sprites.up;
          if (moving && lastKey === "w") {
            playerMovement.up();
          } else if (moving && lastKey === "wd") {
            playerMovement.upAndRight();
          } else if (moving && lastKey === "wa") {
            playerMovement.upAndLeft();
          }
        } else if (keys.a.pressed && ["a", "wa", "sa"].includes(lastKey)) {
          moving = checkBoundaries(boundaries);
          // player.image = player.sprites.left;
          players[CURRENT_USER_ID].image =
            players[CURRENT_USER_ID].sprites.left;
          if (moving && lastKey === "a") {
            playerMovement.left();
          } else if (moving && lastKey === "wa") {
            playerMovement.upAndLeft();
          } else if (moving && lastKey === "sa") {
            playerMovement.downAndLeft();
          }
        } else if (keys.s.pressed && ["s", "sa", "sd"].includes(lastKey)) {
          moving = checkBoundaries(boundaries);
          // player.image = player.sprites.down;
          players[CURRENT_USER_ID].image =
            players[CURRENT_USER_ID].sprites.down;
          if (moving && lastKey === "s") {
            playerMovement.down();
          } else if (moving && lastKey === "sa") {
            playerMovement.downAndLeft();
          } else if (moving && lastKey === "sd") {
            playerMovement.downAndRight();
          }
        } else if (keys.d.pressed && ["d", "wd", "sd"].includes(lastKey)) {
          moving = checkBoundaries(boundaries);
          // player.image = player.sprites.right;
          players[CURRENT_USER_ID].image =
            players[CURRENT_USER_ID].sprites.right;
          if (moving && lastKey === "d") {
            playerMovement.right();
          } else if (moving && lastKey === "wd") {
            playerMovement.upAndRight();
          } else if (moving && lastKey === "sd") {
            playerMovement.downAndRight();
          }
        }
        typeof updatedUserVelocity === "function" &&
          updatedUserVelocity(CURRENT_USER_ID, players[CURRENT_USER_ID]);
      }

      if (inAreaMeeting1Zone) {
        if (!inX.current.zone1) {
          inX.current.zone1 = true;
          connectViaPeer("zone-1");
        }
      } else {
        if (inX.current.zone1) {
          inX.current.zone1 = false;
          typeof disconnectCurrentUser === "function" &&
            disconnectCurrentUser();
        }
      }
      if (inAreaMeeting2Zone) {
        if (!inX.current.zone2) {
          inX.current.zone2 = true;
          connectViaPeer("zone-2");
        }
      } else {
        if (inX.current.zone2) {
          inX.current.zone2 = false;
          typeof disconnectCurrentUser === "function" &&
            disconnectCurrentUser();
        }
      }
    }
    animate();
    waterAnimation();

    const btnUpEl = document.getElementById("btn-up");

    btnUpEl.addEventListener("touchstart", (e) => {
      keys.w.pressed = true;
      lastKey = "w";
    });

    btnUpEl.addEventListener("touchend", (e) => {
      keys.w.pressed = false;
      lastKey = "";
    });

    const btnDownEl = document.getElementById("btn-down");

    btnDownEl.addEventListener("touchstart", (e) => {
      keys.s.pressed = true;
      lastKey = "s";
    });

    btnDownEl.addEventListener("touchend", (e) => {
      keys.s.pressed = false;
      lastKey = "";
    });

    const btnLeftEl = document.getElementById("btn-left");

    btnLeftEl.addEventListener("touchstart", (e) => {
      keys.a.pressed = true;
      lastKey = "a";
    });

    btnLeftEl.addEventListener("touchend", (e) => {
      keys.a.pressed = false;
      lastKey = "";
    });
    const btnRightEl = document.getElementById("btn-right");

    btnRightEl.addEventListener("touchstart", (e) => {
      keys.d.pressed = true;
      lastKey = "d";
    });

    btnRightEl.addEventListener("touchend", (e) => {
      keys.d.pressed = false;
      lastKey = "";
    });
    window.addEventListener("keypress", (e) => {
      switch (e.code) {
        case "KeyW":
          keys.w.pressed = true;
          lastKey = "w";
          if (keys.d.pressed) {
            lastKey = "wd";
          } else if (keys.a.pressed) {
            lastKey = "wa";
          }
          break;
        case "KeyA":
          keys.a.pressed = true;
          lastKey = "a";
          if (keys.w.pressed) {
            lastKey = "wa";
          } else if (keys.s.pressed) {
            lastKey = "sa";
          }
          break;
        case "KeyS":
          keys.s.pressed = true;
          lastKey = "s";
          if (keys.d.pressed) {
            lastKey = "sd";
          } else if (keys.a.pressed) {
            lastKey = "sa";
          }
          break;
        case "KeyD":
          keys.d.pressed = true;
          lastKey = "d";
          if (keys.w.pressed) {
            lastKey = "wd";
          } else if (keys.s.pressed) {
            lastKey = "sd";
          }
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      localStorage.setItem(
        "offset",
        JSON.stringify({ x: movables[0].position.x, y: movables[0].position.y })
      );
      switch (e.code) {
        case "KeyW":
          keys.w.pressed = false;
          if (["wa", "wd"].includes(lastKey)) {
            lastKey = lastKey.replace("w", "");
          }
          break;
        case "KeyA":
          keys.a.pressed = false;
          if (["wa", "sa"].includes(lastKey)) {
            lastKey = lastKey.replace("a", "");
          }
          break;
        case "KeyS":
          keys.s.pressed = false;
          if (["sa", "sd"].includes(lastKey)) {
            lastKey = lastKey.replace("s", "");
          }
          break;
        case "KeyD":
          keys.d.pressed = false;
          if (["wd", "sd"].includes(lastKey)) {
            lastKey = lastKey.replace("d", "");
          }
          break;
      }
    });
  }, []);

  return (
    <main className="select-none">
      <canvas id="myCanvas"></canvas>
      <button
        id="btn-up"
        className="absolute select-none bottom-24 left-14 w-fit bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        ↑
      </button>
      <button
        id="btn-down"
        className="absolute select-none bottom-4 left-14 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        ↓
      </button>
      <button
        id="btn-left"
        className="absolute select-none bottom-14 left-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        ←
      </button>
      <button
        id="btn-right"
        className="absolute select-none bottom-14 left-20   bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        →
      </button>
      <div id="video-grid" className="absolute bottom-0 m-4 flex">
        {videoList.map(({ id, src }) => (
          <video
            key={id}
            ref={(video) => {
              if (video) {
                video.srcObject = src;
              }
            }}
            id={id}
            width={260}
            muted
            autoPlay
            playsInline
          />
        ))}
      </div>
    </main>
  );
}
