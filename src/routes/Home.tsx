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
  const [TopAlbums, setTopAlbums] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const navigate = useNavigate();

  useEffect(() => {
    checkAccessKey();
    getProfile();
    getUserTopAlbums();
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

  async function getUserTopAlbums() {
    console.log("Getting Top Songs");
    const accessToken = localStorage.getItem("access_token");
    let TopAlbumsParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", TopAlbumsParams)
      .then((result) => result.json())
      .then((data) => {
        setTopAlbums(data.items)
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
          <h1 className="display-1"><span className="spotifyGreenText">Spot</span>Me</h1>
          <Button size="sm" className="spotify-themeify-btn" onClick={logoutSpotify}>Logout</Button>
        </Col>
      </Row>
      <Row>
        <Col xs={4} className="border border-success p-2 mb-2 border-opacity-50">
          <ProfileDisplay
            display_name={profile.display_name}
            email={profile.email}
            followers={profile.followers ? profile.followers.total : "0"}
          />
        </Col>
      <Col xs={8} className="p-2">
          <h2 className=""><span className="spotifyGreenText">{profile.display_name}'s</span> Top Songs</h2>
          <CardGroup>
          {TopAlbums && TopAlbums.map((track) => {
            return (
                <Card style={{ width: '5rem' }}>
                  <Card.Img
                    width={50}
                    src={track.album.images[0].url}
                    style={{ borderRadius: '4%', }}
                  />
                  <Card.Body>
                    <Card.Title>{track.album.name}</Card.Title>
                </Card.Body>
                <Card.Footer>
                  <Card.Subtitle className="align-text-bottom">{track.artists[0].name}</Card.Subtitle>
                </Card.Footer>
                {/* <Card.Footer>
                  <Button size="sm" className="spotify-themeify-btn" href={track.album.uri}>
                    <img style={{width: "100%"}} src={SpotifyLogoClear} />
                  </Button>
                </Card.Footer> */}
                </Card>
              
            )
          })}
          </CardGroup>
        </Col>
      </Row>
      <Row className="pt-2">
        <Col>
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
          <div style={{display:"flex", flexWrap:"wrap"}}>
            {albums.map((album) => {
              return <Card style={{ width: "10rem" }}>
                <Card.Img
                  width={200}
                  src={album.images[0].url}
                  style={{ borderRadius: '4%', }}
                />
                <Card.Body style={{ color: 'white' }}>
                  <Card.Title style={{
                    whiteSpace: 'wrap',
                    fontWeight: 'bold',
                    maxWidth: '200px',
                    fontSize: '18px',
                    marginTop: '10px',
                  }}
                  >{album.name}</Card.Title>

                  <Card.Text>{album.release_date}</Card.Text>
                </Card.Body>
              </Card>
            })}
          </div>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Home;