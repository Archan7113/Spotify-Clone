let current_song = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  // Check if seconds is a valid number
  if (isNaN(seconds) || seconds < 0) {
    return "00:00"; // Default value for invalid or negative seconds
  }

  // Round the seconds to the nearest integer
  seconds = Math.floor(seconds);

  // Calculate minutes and seconds
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Format minutes and seconds to always be two digits
  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  // Return the formatted time
  return `${formattedMins}:${formattedSecs}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
                <div>Diwana</div>
              </div>
              <div class="playnow">
                <span>Play now</span>
                <img class="invert" src="img/play.svg" alt="">
              </div>
        </li>`;
  }

  //Attach an eventlistner to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
  
}

let playMusic = (track, pause = false) => {
  current_song.src = (`/${currFolder}/`) + track;
  if (!pause) {
    play.src = "img/pause.svg";
    current_song.play();
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if(e.href.includes("/songs/")){
        let folder = (e.href.split("/").slice(-1)[0])
        //Get the metadata of the folder
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder = "${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 36 36"
                  width="36"
                  height="36"
                >
                  <circle cx="18" cy="18" r="18" fill="green" />
                  <polygon points="13,10 25,18 13,26" fill="black" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
    }
  }
  //Load a playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e =>{
    e.addEventListener("click" ,async item=>{
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    })
  })
}

async function main() {
  //Get the list of the all songs
  await getSongs("songs/cs");
  playMusic(songs[0], true);
  
  //Display all albums
  displayAlbums()
  //Attach an eventlistner to play next and prev

  play.addEventListener("click", () => {
    if (current_song.paused) {
      current_song.play();
      play.src = "img/pause.svg";
    } else {
      current_song.pause();
      play.src = "img/play.svg";
    }
  });

  //Listen for time update event
  current_song.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      current_song.currentTime
    )} / ${formatTime(current_song.duration)}`;

    //move the circle
    document.querySelector(".circle").style.left =
      (current_song.currentTime / current_song.duration) * 100 + "%";
  });

  //Add an EventListener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let parcent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = parcent + "%";
    current_song.currentTime = (current_song.duration * parcent) / 100;
  });
  //Add an eventlistner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  //Add an eventlistner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  //Add an eventlistner to the prev and next button
  prev.addEventListener("click", () => {
    let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    let vol = current_song.volume = parseInt(e.target.value)/100
  })

  //Add an eventlistner to mute the track
  
  document.querySelector(".volume>img").addEventListener("click", e=>{

    if(e.target.src.includes("img/volume.svg")){
      e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
      current_song.volume = 0;
    }
    else{
      current_song.volume = .10;
      e.target.src = e.target.src.replaceAll("img/mute.svg","img/volume.svg")
      e.target.src = "img/volume.svg"
    }
  })
}

main();
