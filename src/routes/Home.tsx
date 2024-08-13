import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Col, CardGroup, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import ProfileDisplay from '../Components/ProfileDisplay';
import SpotifyLogoClear from '/public/icons/SpotifyLogoClear.png';
import '../ComponentsCSS/Home.css'

function Home() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState([]);
  const [profile, setProfile] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const navigate = useNavigate();

  useEffect(() => {
    checkAccessKey();
    getProfile();
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

  function logoutSpotify() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("expires_in")
    navigate("/");
  }

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAccessToken,
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
        setAlbums(data.items);
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
        console.log(data)
        setProfile(data);
      });
  }

  async function getUserTopSongs() {
    console.log("Getting Top Songs");
    const accessToken = localStorage.getItem("access_token");
    let topSongsParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", topSongsParams)
      .then((result) => result.json())
      .then((data) => {
        setTopSongs(data.items)
      }).catch((error) => { console.log("Error Fetching User's Top Songs: " + error) });
  }
  return (
    <Container
      className="home-container"
    >
      <Row
        className="home-header"
      >
        <Col>
          <h1><span className="spotifyGreenText">Spot</span>Me</h1>
          <Button size="sm" className="spotify-themeify-btn" onClick={logoutSpotify}>Logout</Button>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <ProfileDisplay
            display_name={profile.display_name}
            email={profile.email}
            followers={profile.followers ? profile.followers.total : "0"}
          />
        </Col>
      <Col xs={8} >
          <h2 className=""><span className="spotifyGreenText">{profile.display_name}'s</span> Top Songs</h2>
          <CardGroup>
          {topSongs && topSongs.map((song) => {
            return (
                <Card style={{ width: '5rem' }}>
                  <Card.Img
                    width={50}
                    src={song.album.images[0].url}
                    style={{ borderRadius: '4%', }}
                  />
                  <Card.Body>
                    <Card.Title>{song.album.name}</Card.Title>
                    <Card.Subtitle>{song.artists[0].name}</Card.Subtitle>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" className="spotify-themeify-btn" href={song.album.uri}>
                    <img style={{width: "100%"}} src={SpotifyLogoClear} />
                  </Button>
                </Card.Footer>
                </Card>
              
            )
          })}
          </CardGroup>
        </Col>
      </Row>
      <Row>
        <InputGroup>
          <FormControl
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
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />

          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Row>
    </Container>
  )
}

export default Home;