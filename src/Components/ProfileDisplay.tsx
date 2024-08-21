import { useState, useEffect } from 'react';
import '../ComponentsCSS/ProfileDisplay.css';
interface ProfileDisplay{
  profile_image: String;
  display_name: String;
  email: String;
  followers: String;
  product: String;
  userPlaylists: [];
}

function ProfileDisplay(props: ProfileDisplay) {
  const [playlistTotalSaves, setPlaylistTotalSaves] = useState(0);
  const userPlaylistsCount = props.userPlaylists.length;

   function getPlaylistsTotalSaves() {
    let promises = props.userPlaylists.map((playlist: any) => {
      getPlaylistSaves(playlist.id);
    })
    Promise.all(promises).then((results) => {
      let totalSaves = results.reduce((acc, cur) => acc + cur, 0);
      setPlaylistTotalSaves(totalSaves);
      console.log("Total Saves: " + totalSaves);
      return totalSaves;
    });
  }
  
  useEffect(() => {
    getPlaylistsTotalSaves();
  }, []);

  async function getPlaylistSaves(id: string): Promise<number> {
    const accessToken = localStorage.getItem("access_token");
    let playlistSavesParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    fetch(`https://api.spotify.com/v1/playlists/${id}`, playlistSavesParams)
      .then((result) => result.json())
      .then((data) => data.followers)
      .then((followers) => {
        console.log("Playlist Saves: " + followers.total);
        return followers.total;
        // return new Promise(resolve => setTimeout(() => followers.total, 100));
      })
      .catch((error) => {
        console.log("Error Fetching Playlist Saves: " + error)
        return 0;
      });
    return 0;
  }

  return (
    <div className="h-auto profileStats">
      <div style={{ display:"flex", alignItems:"end" }}>
        <img src={props.profile_image} className="rounded mr-1 h-auto" /><h2 className="m-0"><span className="spotifyGreenText">Pro</span>file</h2>
      </div>
      <p className="fw-light">
        <span className="fw-bold">Display Name: </span> {props.display_name}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Email: </span> {props.email}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Followers: </span> {props.followers}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Account Type: </span> {props.product}
      </p>
      <h3><span className="fw-bold spotifyGreenText">Play</span>lists</h3>
      <p className="fw-light">
        <span className="fw-bold">Number of Playlists: </span>{userPlaylistsCount}
      </p>
      <p>
        <span className="fw-bold">Total Playlist Saves: </span>{playlistTotalSaves}
      </p>
    </div>
  );
}

export default ProfileDisplay;