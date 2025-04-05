import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import ProfileDisplay from '../Components/ProfileDisplay';
import RecommendSongs from '../Components/RecommendSongs';
import '../ComponentsCSS/Home.css'

type Profile ={
  display_name: string;
  email: string;
  followers: {
    total: number;
  };
  product: string;
  images: {
    url: string;
  }[];
}

type Playlists = [{
  id: string;
  length: number;
  }
];

type Album = [{
  name: string;
  release_date: string;
  images: {
    url: string;
  }[];
}];

type Song = [{
  name: string;
  album: {
    images: {
      url: string;
    }[];
  };
  artists: {
    name: string;
  }[];
}];
function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState<Album | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [TopSongs, setTopSongs] = useState<Song | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlists|null>(null);
  const [timeRange, setTimeRange] = useState("long_term");
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const navigate = useNavigate();

  useEffect(() => {
    checkAccessKey();
    getProfile();
    getUserPlaylists();
    getUserTopSongs();
  }, []);

  function checkAccessKey() {
    const accessToken = localStorage.getItem("access_token");
    let expires_in = localStorage.getItem("expires_in")
    console.log("Access Token: " + accessToken);
    console.log("Current Time: " + new Date().getTime());
    console.log("Token expires in: " + Number(expires_in));
    if (new Date().getTime() > Number(expires_in)) {
      console.log("Token expired")
      refreshToken();
    } else {
      console.log("Token still valid")
    }
  }

  function getUserPlaylists() {
    const accessToken = localStorage.getItem("access_token");
    let playlistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    fetch("https://api.spotify.com/v1/me/playlists", playlistParams)
      .then((result) => result.json())
      .then((data) => {
        setUserPlaylists(data.items);
      });
  }
  function refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken!);

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    })
      .then((result) => result.json())
      .then((data) => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("expires_in", String(new Date().getTime() + data.expires_in * 1000));
      }).catch((error) => {
        console.log("Error: " + error);
        navigate("/");
      });
  }

  function setLongTerm() {
    setTimeRange("long_term");
    getUserTopSongs()
  }

  function setMediumTerm() {
    setTimeRange("medium_term");
    getUserTopSongs()
  }
  function setShortTerm() {
    setTimeRange("short_term");
    getUserTopSongs()
  }

  function logoutSpotify() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("expires_in")
    navigate("/");
  }

  async function search() {
    const accessToken = localStorage.getItem("access_token");
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        return data.artists.items[0].id;
      });
    console.log("Search Input: " + searchInput);
    console.log("Artist ID: " + artistID);

    // Get Albums
    await fetch(
      "https://api.spotify.com/v1/artists/" + artistID + "/albums", artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        setAlbums(data.items.slice(0, 6));
      });
  }

  async function getProfile() {
    console.log("Getting Profile");
    const accessToken = localStorage.getItem("access_token");
    console.log("User Access Token: " + accessToken);
    let profileParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    await fetch("https://api.spotify.com/v1/me", profileParams)
      .then((result) => result.json())
      .then((data) => {
        setProfile(data);
      });
  }

  async function getUserTopSongs() {
    console.log("Getting Top Songs");
    const accessToken = localStorage.getItem("access_token");
    let TopSongsParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${timeRange}`, TopSongsParams)
      .then((result) => result.json())
      .then((data) => {
        console.log(data.items)
        setTopSongs(data.items)
      }).catch((error) => { console.log("Error Fetching User's Top Songs: " + error) });
  }
  return (
    <div className="px-14">
      <div className="home-header">
        <div>
          <h1 className="display-1"><span className="spotifyGreenText">Spot</span>Me</h1>
        </div>
      </div>
      <div className="flex w-5/6 self-center m-auto space-x-3">
        <div className="border border-success p-2 border-opacity-50 rounded w-1/3">
          {profile && userPlaylists && <ProfileDisplay
            profile_image={profile.images[0].url}
            display_name={profile.display_name}
            email={profile.email}
            followers={profile.followers.total.toString()}
            product={profile.product}
            userPlaylists={userPlaylists}
          />}
        </div>
        <div className="w-2/3">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2><span className="spotifyGreenText text-4xl">{profile && profile.display_name}'s</span> Top Songs</h2>
            <div className="flex space-x-3 align-text-bottom text-white cursor-pointer">
              <p className={(timeRange == "long_term") ? 'spotifyGreenText' : 'opacity-25'} onClick={setLongTerm}>1 Year</p>
              <p className={(timeRange == "medium_term") ? 'spotifyGreenText' : 'opacity-25' } onClick={setMediumTerm}>6 Months</p>
              <p className={(timeRange == "short_term") ? 'spotifyGreenText' : 'opacity-25' } onClick={setShortTerm}>1 Month</p>
            </div>
            <button className="px-3 bg-green-500 rounded font-medium" onClick={logoutSpotify}>Logout</button>
          </div>
          <div className="flex">
          {TopSongs && TopSongs.map((track) => {
            return(
              <div className="w-1/5" key={track.name}>
                <img
                  className="p-1 rounded-lg"
                  src={track.album.images[0].url}
                />
                <div className="">
                  <p className="lg:text-xl sm:text-sm font-medium">{track.name} </p>
                  <p className="align-text-bottom lg:text-lg sm:text-xs spotifyGreenText">{track.artists[0].name} </p>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>
      <div className="pt-2">
        <div>
          <form className="flex">
            <input
              placeholder="Search For Artist"
              type="input"
              aria-label="Search for an Artist"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  search();
                }
              }} // search function
              onChange={(event) => setSearchInput(event.target.value)} // setSearch
              style={{
                width: "300px",
                height: "35px",
                borderColor: "limegreen",
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: "5px",
              }}
              />
            <button className="spotify-themeify-btn px-2 rounded" onClick={search}>Search</button>
          </form>
        </div>
          <div className="flex">
            {albums && albums.map((album) => {
              return <div style={{ width: "33%" }} key={album.name}>
                <img
                  src={album.images[0].url}
                  className='w-1/3'
                />
                <div style={{ color: 'white' }}>
                  <div style={{
                    whiteSpace: 'wrap',
                    fontWeight: 'bold',
                    maxWidth: '200px',
                    fontSize: 'auto',
                    marginTop: '10px',
                  }}
                  >{album.name}</div>
                  <div>{album.release_date}</div>
                </div>
              </div>
            })}
          </div>
        </div>
        <div>
            <RecommendSongs></RecommendSongs>
        </div>
    </div>
  )
}

export default Home;