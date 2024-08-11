import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import ProfileDisplay from '../Components/ProfileDisplay';
import './App.css'

function Home() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState([]);
  const [profile, setProfile] = useState([]);
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const navigate = useNavigate();

  useEffect(() => {
    checkAccessKey();
    getProfile();
  }, []);

  function checkAccessKey() {
    const accessToken = localStorage.getItem("access_token");
    setUserAccessToken(localStorage.getItem("access_token")!);
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

    if (!refreshToken) {
      navigate("/");
    }
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
    });

  }

  function logoutSpotify(){
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
    console.log("User Access Token: " + userAccessToken);
    const accessToken = localStorage.getItem("access_token");
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
  return (
    <Container
      style={{
      width: "100vw",
      justifyContent: "center"
      }}
    >
    <Row
      style={{
        justifyContent: "around"
      }}
    >
      <h1><span className="title-spot">Spot</span>Me</h1> 
      <Button className="spotify-themeify-btn" onClick={logoutSpotify}>Logout</Button>
          
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
    <Row>
        <ProfileDisplay
          display_name={profile.display_name}
          email={profile.email}
          followers="2"
        />
    </Row>
    </Container>
  )
}

export default Home;