import { useState, useEffect } from 'react';
interface ProfileDisplay{
  profile_image: string;
  display_name: string;
  email: string;
  followers: string;
  product: string;
  userPlaylists: Playlists;
}

type Playlists = [{
  id: string;
  length: number;
}
];

function ProfileDisplay(props: ProfileDisplay) {
  const [playlistTotalSaves, setPlaylistTotalSaves] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  //const playlistCount = 0;
  useEffect(() => {
    setPlaylistCount(props.userPlaylists.length);
    getPlaylistsTotalSaves();

  }, [props.userPlaylists]);

  function getPlaylistsTotalSaves() {
    const playlistPromises: (Promise<number>)[] = [];
    let total = 0;
    props.userPlaylists.forEach((playlist: any) => {
      playlistPromises.push(getPlaylistSaves(playlist.id));
    })

    Promise.all(playlistPromises).then((playlistData) =>
      playlistData.forEach((saves) => { total += saves }))
    .then(() => setPlaylistTotalSaves(total))
    .catch((error) => { 
      console.log("Error Fetching Playlist Saves: " + error)
    });
  }

  async function getPlaylistSaves(id: string): Promise<number> {
    const accessToken = localStorage.getItem("access_token");
    let playlistSavesParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    return fetch(`https://api.spotify.com/v1/playlists/${id}`, playlistSavesParams)
      .then((result) => result.json())
      .then((data) => data.followers)
      .then((followers) => { console.log(followers.total); return followers.total })
      .catch((error) => {
        console.log("Error Fetching Playlist: " + error)
        return 0;
      });
  }

  return (
    <div className="text-left">
      <div className="flex place-items-end w-full">
        <img src={props.profile_image} className="rounded mr-1 w-1/5 overflow-hidden" />
        <h2 className="m-0 text-2xl spotifyGreenText">{props.display_name}</h2>
      </div>
      
      <p className="fw-light">
        <span className="fw-bold">Email: </span> {props.email}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Followers: </span> {props.followers}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Account Type: </span> {props.product}
      </p>
      <h3 className="text-xl"><span className="fw-bold spotifyGreenText">Play</span>lists</h3>
      <p className="fw-light">
        <span className="fw-bold">Number of Playlists: </span>{playlistCount}
      </p>
      <p>
        <span className="fw-bold">Total Playlist Saves: </span>{playlistTotalSaves}
      </p>
    </div>
  );
}

export default ProfileDisplay;